-- ============================================
-- SUPABASE SQL SETUP FOR BRADWEARFLOW
-- Jalankan di Supabase SQL Editor
-- ============================================
-- 1. TABEL CHAT MESSAGES
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender TEXT NOT NULL,
    text TEXT,
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Enable RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
-- Allow all operations for anon users (public chat)
CREATE POLICY "Allow all for chat_messages" ON chat_messages FOR ALL USING (true) WITH CHECK (true);
-- Enable Realtime
ALTER PUBLICATION supabase_realtime
ADD TABLE chat_messages;
-- 2. TABEL ONLINE USERS
CREATE TABLE IF NOT EXISTS online_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    last_seen TIMESTAMPTZ DEFAULT NOW()
);
-- Enable RLS
ALTER TABLE online_users ENABLE ROW LEVEL SECURITY;
-- Allow all operations for anon users
CREATE POLICY "Allow all for online_users" ON online_users FOR ALL USING (true) WITH CHECK (true);
-- Enable Realtime
ALTER PUBLICATION supabase_realtime
ADD TABLE online_users;
-- 3. TABEL ORDERS (GLOBAL)
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    kode_barang TEXT NOT NULL,
    nama_penjahit TEXT NOT NULL,
    model TEXT NOT NULL,
    model_detail TEXT,
    jumlah_pesanan INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Menunggu',
    size_details JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- Allow all operations for anon users
CREATE POLICY "Allow all for orders" ON orders FOR ALL USING (true) WITH CHECK (true);
-- Enable Realtime
ALTER PUBLICATION supabase_realtime
ADD TABLE orders;
-- ============================================
-- SELESAI! Tabel sudah siap digunakan
-- ============================================