-- Bradflow tracking schema: relational work items, status audit, RPCs, and RLS.
-- Run after 20260607110000_user_roles.sql.

create extension if not exists pgcrypto;

alter table public.orders add column if not exists owner_user_id uuid references auth.users(id);
alter table public.orders add column if not exists source text not null default 'migration';
alter table public.orders add column if not exists scan_payload jsonb;

update public.orders set status = 'Selesai' where status = 'Beres';
update public.orders set source = 'migration' where source is null;

update public.orders o
set owner_user_id = ur.user_id
from public.user_roles ur
where o.owner_user_id is null
  and lower(trim(o.nama_penjahit)) = lower(trim(coalesce(ur.display_name, '')));

alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders
  add constraint orders_status_check check (status in ('Proses', 'Selesai'));

alter table public.orders drop constraint if exists orders_source_check;
alter table public.orders
  add constraint orders_source_check check (source in ('scan', 'manual', 'migration'));

create table if not exists public.order_work_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  sort_order integer not null default 0,
  warna text,
  assigned_tailor_user_id uuid references auth.users(id),
  assigned_tailor_name text,
  candidate_tailor_name text,
  tailor_confirmation_status text not null default 'confirmed'
    check (tailor_confirmation_status in ('confirmed', 'needs_confirmation', 'not_tailor')),
  gender text,
  tangan text,
  model text,
  item_attributes jsonb not null default '{}'::jsonb,
  pcs_total integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_work_item_sizes (
  id uuid primary key default gen_random_uuid(),
  work_item_id uuid not null references public.order_work_items(id) on delete cascade,
  sort_order integer not null default 0,
  size text not null,
  quantity integer not null default 0 check (quantity >= 0),
  nama_per_size text,
  is_custom_size boolean not null default false,
  custom_measurements jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  old_status text,
  new_status text not null,
  changed_by uuid references auth.users(id),
  changed_at timestamptz not null default now(),
  source_app text not null default 'bradflow'
);

create index if not exists idx_orders_owner_user_id on public.orders(owner_user_id);
create index if not exists idx_orders_kode_barang on public.orders(kode_barang);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_order_work_items_order_id on public.order_work_items(order_id);
create index if not exists idx_order_work_items_tailor on public.order_work_items(assigned_tailor_name);
create index if not exists idx_order_work_item_sizes_work_item_id on public.order_work_item_sizes(work_item_id);
create index if not exists idx_order_status_history_order_id on public.order_status_history(order_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists trg_order_work_items_updated_at on public.order_work_items;
create trigger trg_order_work_items_updated_at
before update on public.order_work_items
for each row execute function public.set_updated_at();

drop trigger if exists trg_order_work_item_sizes_updated_at on public.order_work_item_sizes;
create trigger trg_order_work_item_sizes_updated_at
before update on public.order_work_item_sizes
for each row execute function public.set_updated_at();

create or replace function public.refresh_order_total(p_order_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.orders
  set jumlah_pesanan = coalesce((
    select sum(wi.pcs_total) from public.order_work_items wi where wi.order_id = p_order_id
  ), 0)
  where id = p_order_id;
$$;

create or replace function public.refresh_totals_from_size_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_work_item_id uuid;
  v_order_id uuid;
begin
  v_work_item_id := case when tg_op = 'DELETE' then old.work_item_id else new.work_item_id end;
  update public.order_work_items
  set pcs_total = coalesce((
    select sum(s.quantity) from public.order_work_item_sizes s where s.work_item_id = v_work_item_id
  ), 0)
  where id = v_work_item_id
  returning order_id into v_order_id;

  if v_order_id is not null then
    perform public.refresh_order_total(v_order_id);
  end if;
  return null;
end;
$$;

drop trigger if exists trg_refresh_totals_from_size_change on public.order_work_item_sizes;
create trigger trg_refresh_totals_from_size_change
after insert or update of quantity or delete on public.order_work_item_sizes
for each row execute function public.refresh_totals_from_size_change();

create or replace function public.refresh_total_from_work_item_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_order_total(case when tg_op = 'DELETE' then old.order_id else new.order_id end);
  return null;
end;
$$;

drop trigger if exists trg_refresh_total_from_work_item_change on public.order_work_items;
create trigger trg_refresh_total_from_work_item_change
after insert or update of pcs_total or delete on public.order_work_items
for each row execute function public.refresh_total_from_work_item_change();

create or replace function public.audit_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from new.status then
    new.completed_at = case when new.status = 'Selesai' then coalesce(new.completed_at, now()) else null end;
    insert into public.order_status_history(order_id, old_status, new_status, changed_by, source_app)
    values (new.id, old.status, new.status, auth.uid(), 'database');
  end if;
  return new;
end;
$$;

create or replace function public.audit_initial_order_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.order_status_history(order_id, old_status, new_status, changed_by, source_app)
  values (new.id, null, new.status, auth.uid(), 'database');
  return new;
end;
$$;

drop trigger if exists trg_orders_initial_status_audit on public.orders;
create trigger trg_orders_initial_status_audit
after insert on public.orders
for each row execute function public.audit_initial_order_status();

drop trigger if exists trg_orders_status_audit on public.orders;
create trigger trg_orders_status_audit
before update of status on public.orders
for each row execute function public.audit_order_status_change();

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.user_roles
  where user_id = auth.uid() and is_active = true
  limit 1;
$$;

create or replace function public.save_order_with_items(
  p_order jsonb,
  p_work_items jsonb default '[]'::jsonb
)
returns public.orders
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_order public.orders;
  v_item jsonb;
  v_size jsonb;
  v_work_item_id uuid;
begin
  insert into public.orders (
    id, kode_barang, owner_user_id, nama_penjahit, model, model_detail,
    jumlah_pesanan, status, size_details, cs, konsumen, warna, tanggal_order,
    tanggal_target_selesai, saku_type, saku_color, payment_status, priority,
    deskripsi_pekerjaan, embroidery_status, embroidery_notes, completed_at,
    deleted_at, source, scan_payload
  )
  values (
    coalesce(nullif(p_order->>'id', '')::uuid, gen_random_uuid()),
    p_order->>'kode_barang',
    coalesce(nullif(p_order->>'owner_user_id', '')::uuid, auth.uid()),
    p_order->>'nama_penjahit',
    p_order->>'model',
    p_order->>'model_detail',
    coalesce((p_order->>'jumlah_pesanan')::integer, 0),
    coalesce(p_order->>'status', 'Proses'),
    coalesce(p_order->'size_details', '[]'::jsonb),
    p_order->>'cs',
    p_order->>'konsumen',
    p_order->>'warna',
    p_order->>'tanggal_order',
    p_order->>'tanggal_target_selesai',
    p_order->>'saku_type',
    p_order->>'saku_color',
    p_order->>'payment_status',
    p_order->>'priority',
    p_order->>'deskripsi_pekerjaan',
    p_order->>'embroidery_status',
    p_order->>'embroidery_notes',
    nullif(p_order->>'completed_at', '')::timestamptz,
    nullif(p_order->>'deleted_at', '')::timestamptz,
    coalesce(p_order->>'source', 'manual'),
    p_order->'scan_payload'
  )
  on conflict (id) do update set
    kode_barang = excluded.kode_barang,
    nama_penjahit = excluded.nama_penjahit,
    model = excluded.model,
    model_detail = excluded.model_detail,
    jumlah_pesanan = excluded.jumlah_pesanan,
    status = excluded.status,
    size_details = excluded.size_details,
    cs = excluded.cs,
    konsumen = excluded.konsumen,
    warna = excluded.warna,
    tanggal_order = excluded.tanggal_order,
    tanggal_target_selesai = excluded.tanggal_target_selesai,
    saku_type = excluded.saku_type,
    saku_color = excluded.saku_color,
    payment_status = excluded.payment_status,
    priority = excluded.priority,
    deskripsi_pekerjaan = excluded.deskripsi_pekerjaan,
    embroidery_status = excluded.embroidery_status,
    embroidery_notes = excluded.embroidery_notes,
    completed_at = excluded.completed_at,
    deleted_at = excluded.deleted_at,
    source = excluded.source,
    scan_payload = excluded.scan_payload
  returning * into v_order;

  delete from public.order_work_items where order_id = v_order.id;

  for v_item in select value from jsonb_array_elements(coalesce(p_work_items, '[]'::jsonb))
  loop
    insert into public.order_work_items (
      order_id, sort_order, warna, assigned_tailor_user_id, assigned_tailor_name,
      candidate_tailor_name, tailor_confirmation_status, gender, tangan, model,
      item_attributes, pcs_total
    )
    values (
      v_order.id,
      coalesce((v_item->>'sort_order')::integer, 0),
      v_item->>'warna',
      coalesce(
        nullif(v_item->>'assigned_tailor_user_id', '')::uuid,
        (
          select ur.user_id from public.user_roles ur
          where lower(trim(coalesce(ur.display_name, ''))) = lower(trim(coalesce(v_item->>'assigned_tailor_name', '')))
            and ur.is_active = true
          limit 1
        )
      ),
      v_item->>'assigned_tailor_name',
      v_item->>'candidate_tailor_name',
      coalesce(v_item->>'tailor_confirmation_status', 'confirmed'),
      v_item->>'gender',
      v_item->>'tangan',
      v_item->>'model',
      coalesce(v_item->'item_attributes', '{}'::jsonb),
      coalesce((v_item->>'pcs_total')::integer, 0)
    )
    returning id into v_work_item_id;

    for v_size in select value from jsonb_array_elements(coalesce(v_item->'sizes', '[]'::jsonb))
    loop
      insert into public.order_work_item_sizes (
        work_item_id, sort_order, size, quantity, nama_per_size,
        is_custom_size, custom_measurements
      )
      values (
        v_work_item_id,
        coalesce((v_size->>'sort_order')::integer, 0),
        coalesce(v_size->>'size', ''),
        coalesce((v_size->>'quantity')::integer, 0),
        v_size->>'nama_per_size',
        coalesce((v_size->>'is_custom_size')::boolean, false),
        v_size->'custom_measurements'
      );
    end loop;
  end loop;

  return v_order;
end;
$$;

create or replace function public.update_order_status(
  p_order_id uuid,
  p_status text,
  p_source_app text default 'bradflow'
)
returns public.orders
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_order public.orders;
begin
  if p_status not in ('Proses', 'Selesai') then
    raise exception 'Invalid status: %', p_status;
  end if;

  update public.orders
  set status = p_status
  where id = p_order_id
  returning * into v_order;

  if v_order.id is null then
    raise exception 'Order not found or access denied';
  end if;

  update public.order_status_history
  set source_app = p_source_app
  where id = (
    select id from public.order_status_history
    where order_id = p_order_id
    order by changed_at desc
    limit 1
  );

  return v_order;
end;
$$;

-- Backfill one work item per legacy SizeDetail. New app grouping will consolidate on next save.
insert into public.order_work_items (
  order_id, sort_order, warna, assigned_tailor_name, candidate_tailor_name,
  tailor_confirmation_status, gender, tangan, model, item_attributes, pcs_total
)
select
  o.id,
  d.ordinality - 1,
  coalesce(d.value->>'warna', o.warna),
  coalesce(d.value->>'namaPenjahit', o.nama_penjahit),
  d.value->>'candidateTailorName',
  coalesce(d.value->>'tailorConfirmationStatus', 'confirmed'),
  coalesce(d.value->>'gender', 'Pria'),
  coalesce(d.value->>'tangan', 'Pendek'),
  coalesce(d.value->>'model', o.model),
  d.value - 'size' - 'jumlah' - 'namaPerSize' - 'isCustomSize' - 'customMeasurements',
  coalesce((d.value->>'jumlah')::integer, 0)
from public.orders o
cross join lateral jsonb_array_elements(coalesce(o.size_details, '[]'::jsonb)) with ordinality d(value, ordinality)
where not exists (select 1 from public.order_work_items wi where wi.order_id = o.id);

insert into public.order_work_item_sizes (
  work_item_id, sort_order, size, quantity, nama_per_size, is_custom_size, custom_measurements
)
select
  wi.id, 0,
  coalesce(d.value->>'size', ''),
  coalesce((d.value->>'jumlah')::integer, 0),
  d.value->>'namaPerSize',
  coalesce((d.value->>'isCustomSize')::boolean, false),
  d.value->'customMeasurements'
from public.order_work_items wi
join public.orders o on o.id = wi.order_id
cross join lateral jsonb_array_elements(coalesce(o.size_details, '[]'::jsonb)) with ordinality d(value, ordinality)
where wi.sort_order = d.ordinality - 1
  and not exists (select 1 from public.order_work_item_sizes s where s.work_item_id = wi.id);

alter table public.orders enable row level security;
alter table public.order_work_items enable row level security;
alter table public.order_work_item_sizes enable row level security;
alter table public.order_status_history enable row level security;

drop policy if exists "Allow all for orders" on public.orders;
drop policy if exists "orders_select_authenticated" on public.orders;
create policy "orders_select_authenticated" on public.orders for select
using (auth.uid() is not null);

drop policy if exists "orders_insert_owner_or_admin" on public.orders;
create policy "orders_insert_owner_or_admin" on public.orders for insert
with check (owner_user_id = auth.uid() or public.current_user_role() = 'admin');

drop policy if exists "orders_update_owner_or_admin" on public.orders;
create policy "orders_update_owner_or_admin" on public.orders for update
using (owner_user_id = auth.uid() or public.current_user_role() = 'admin')
with check (owner_user_id = auth.uid() or public.current_user_role() = 'admin');

drop policy if exists "orders_delete_admin" on public.orders;
create policy "orders_delete_admin" on public.orders for delete
using (public.current_user_role() = 'admin');

drop policy if exists "work_items_select_authenticated" on public.order_work_items;
create policy "work_items_select_authenticated" on public.order_work_items for select
using (auth.uid() is not null);
drop policy if exists "work_items_write_owner_or_admin" on public.order_work_items;
create policy "work_items_write_owner_or_admin" on public.order_work_items for all
using (exists (
  select 1 from public.orders o
  where o.id = order_id and (o.owner_user_id = auth.uid() or public.current_user_role() = 'admin')
))
with check (exists (
  select 1 from public.orders o
  where o.id = order_id and (o.owner_user_id = auth.uid() or public.current_user_role() = 'admin')
));

drop policy if exists "work_item_sizes_select_authenticated" on public.order_work_item_sizes;
create policy "work_item_sizes_select_authenticated" on public.order_work_item_sizes for select
using (auth.uid() is not null);
drop policy if exists "work_item_sizes_write_owner_or_admin" on public.order_work_item_sizes;
create policy "work_item_sizes_write_owner_or_admin" on public.order_work_item_sizes for all
using (exists (
  select 1 from public.order_work_items wi
  join public.orders o on o.id = wi.order_id
  where wi.id = work_item_id and (o.owner_user_id = auth.uid() or public.current_user_role() = 'admin')
))
with check (exists (
  select 1 from public.order_work_items wi
  join public.orders o on o.id = wi.order_id
  where wi.id = work_item_id and (o.owner_user_id = auth.uid() or public.current_user_role() = 'admin')
));

drop policy if exists "status_history_select_authenticated" on public.order_status_history;
create policy "status_history_select_authenticated" on public.order_status_history for select
using (auth.uid() is not null);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'order_work_items'
  ) then
    alter publication supabase_realtime add table public.order_work_items;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'order_work_item_sizes'
  ) then
    alter publication supabase_realtime add table public.order_work_item_sizes;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'order_status_history'
  ) then
    alter publication supabase_realtime add table public.order_status_history;
  end if;
end;
$$;

grant execute on function public.save_order_with_items(jsonb, jsonb) to authenticated;
grant execute on function public.update_order_status(uuid, text, text) to authenticated;
