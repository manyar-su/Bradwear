import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const managementToken = process.env.SUPABASE_MANAGEMENT_TOKEN;
const oldProjectRef = process.env.OLD_SUPABASE_REF || 'rcaqtzgmepyxgszcwldr';
const newProjectRef = process.env.NEW_SUPABASE_REF || 'kppsavzargjxtwsljwzi';

if (!managementToken) {
  console.error('Missing SUPABASE_MANAGEMENT_TOKEN');
  process.exit(1);
}

const managementHeaders = {
  Authorization: `Bearer ${managementToken}`,
  'Content-Type': 'application/json',
};

const runQuery = async (projectRef, query) => {
  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: managementHeaders,
    body: JSON.stringify({ query }),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Query failed for ${projectRef} (${response.status}): ${text}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const applySqlFile = async (projectRef, relativePath) => {
  const sql = await fs.readFile(path.join(repoRoot, relativePath), 'utf8');
  console.log(`Applying ${relativePath} to ${projectRef}...`);
  await runQuery(projectRef, sql);
};

const importOrders = async () => {
  console.log(`Fetching legacy orders from ${oldProjectRef}...`);
  const legacyOrders = await runQuery(
    oldProjectRef,
    `
      select
        id, kode_barang, nama_penjahit, model, model_detail, jumlah_pesanan,
        status, size_details, created_at, updated_at, deleted_at, cs, konsumen,
        warna, tanggal_order, tanggal_target_selesai, saku_type, saku_color,
        payment_status, priority, deskripsi_pekerjaan, embroidery_status,
        embroidery_notes, completed_at
      from public.orders
      order by created_at asc nulls last;
    `,
  );

  if (!Array.isArray(legacyOrders) || legacyOrders.length === 0) {
    console.log('No legacy orders found.');
    return;
  }

  console.log(`Importing ${legacyOrders.length} legacy orders into ${newProjectRef}...`);
  const payload = Buffer.from(JSON.stringify(legacyOrders), 'utf8').toString('base64');
  await runQuery(
    newProjectRef,
    `
      with payload as (
        select value as row
        from jsonb_array_elements(convert_from(decode('${payload}', 'base64'), 'utf8')::jsonb)
      )
      insert into public.orders (
        id, kode_barang, nama_penjahit, model, model_detail, jumlah_pesanan,
        status, size_details, created_at, updated_at, deleted_at, cs, konsumen,
        warna, tanggal_order, tanggal_target_selesai, saku_type, saku_color,
        payment_status, priority, deskripsi_pekerjaan, embroidery_status,
        embroidery_notes, completed_at, source
      )
      select
        (row->>'id')::uuid,
        row->>'kode_barang',
        row->>'nama_penjahit',
        row->>'model',
        nullif(row->>'model_detail', ''),
        coalesce((row->>'jumlah_pesanan')::integer, 0),
        case when row->>'status' = 'Beres' then 'Selesai' else coalesce(nullif(row->>'status', ''), 'Proses') end,
        coalesce(row->'size_details', '[]'::jsonb),
        coalesce((row->>'created_at')::timestamptz, now()),
        coalesce((row->>'updated_at')::timestamptz, now()),
        nullif(row->>'deleted_at', '')::timestamptz,
        nullif(row->>'cs', ''),
        nullif(row->>'konsumen', ''),
        nullif(row->>'warna', ''),
        nullif(row->>'tanggal_order', ''),
        nullif(row->>'tanggal_target_selesai', ''),
        nullif(row->>'saku_type', ''),
        nullif(row->>'saku_color', ''),
        nullif(row->>'payment_status', ''),
        nullif(row->>'priority', ''),
        nullif(row->>'deskripsi_pekerjaan', ''),
        nullif(row->>'embroidery_status', ''),
        nullif(row->>'embroidery_notes', ''),
        nullif(row->>'completed_at', '')::timestamptz,
        'migration'
      from payload
      on conflict (id) do update set
        kode_barang = excluded.kode_barang,
        nama_penjahit = excluded.nama_penjahit,
        model = excluded.model,
        model_detail = excluded.model_detail,
        jumlah_pesanan = excluded.jumlah_pesanan,
        status = excluded.status,
        size_details = excluded.size_details,
        created_at = excluded.created_at,
        updated_at = excluded.updated_at,
        deleted_at = excluded.deleted_at,
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
        source = 'migration';
    `,
  );
};

const backfillWorkItems = async () => {
  console.log(`Backfilling relational work items in ${newProjectRef}...`);
  await runQuery(
    newProjectRef,
    `
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
    `,
  );
};

const showCounts = async () => {
  const counts = await runQuery(
    newProjectRef,
    `
      select 'orders' as table_name, count(*)::int as count from public.orders
      union all
      select 'order_work_items', count(*)::int from public.order_work_items
      union all
      select 'order_work_item_sizes', count(*)::int from public.order_work_item_sizes
      union all
      select 'order_status_history', count(*)::int from public.order_status_history
      order by table_name;
    `,
  );
  console.log(JSON.stringify(counts, null, 2));
};

const main = async () => {
  console.log(`Migrating Bradflow data from ${oldProjectRef} to ${newProjectRef}...`);
  await applySqlFile(newProjectRef, 'supabase/migrations/20260607110000_user_roles.sql');
  await applySqlFile(newProjectRef, 'supabase/migrations/20260607120000_tracking_schema.sql');
  await applySqlFile(newProjectRef, 'supabase/migrations/20260607130000_anonymous_client_compat.sql');
  await importOrders();
  await backfillWorkItems();
  await showCounts();
  console.log('Migration complete.');
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
