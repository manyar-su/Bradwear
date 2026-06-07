-- Bradflow currently uses a lightweight "nama penjahit" gate and does not
-- create a Supabase Auth session in the client. This compatibility migration
-- keeps the tracking schema readable/writable from the anonymous browser key
-- so history, sync, and status updates continue to work.

grant usage on schema public to anon;
grant select, insert, update, delete on public.orders to anon;
grant select, insert, update, delete on public.order_work_items to anon;
grant select, insert, update, delete on public.order_work_item_sizes to anon;
grant select on public.order_status_history to anon;
grant select on public.user_roles to anon;
grant execute on function public.save_order_with_items(jsonb, jsonb) to anon;
grant execute on function public.update_order_status(uuid, text, text) to anon;
grant execute on function public.current_user_role() to anon;

drop policy if exists "orders_select_anon" on public.orders;
create policy "orders_select_anon" on public.orders for select to anon
using (true);

drop policy if exists "orders_write_anon" on public.orders;
create policy "orders_write_anon" on public.orders for all to anon
using (true)
with check (true);

drop policy if exists "work_items_select_anon" on public.order_work_items;
create policy "work_items_select_anon" on public.order_work_items for select to anon
using (true);

drop policy if exists "work_items_write_anon" on public.order_work_items;
create policy "work_items_write_anon" on public.order_work_items for all to anon
using (true)
with check (true);

drop policy if exists "work_item_sizes_select_anon" on public.order_work_item_sizes;
create policy "work_item_sizes_select_anon" on public.order_work_item_sizes for select to anon
using (true);

drop policy if exists "work_item_sizes_write_anon" on public.order_work_item_sizes;
create policy "work_item_sizes_write_anon" on public.order_work_item_sizes for all to anon
using (true)
with check (true);

drop policy if exists "status_history_select_anon" on public.order_status_history;
create policy "status_history_select_anon" on public.order_status_history for select to anon
using (true);

drop policy if exists "user_roles_select_anon" on public.user_roles;
create policy "user_roles_select_anon" on public.user_roles for select to anon
using (true);
