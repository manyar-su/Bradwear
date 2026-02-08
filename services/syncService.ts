
import { OrderItem, ChatMessage } from '../types';
import { supabaseService, OrderDB } from './supabaseService';

// Local storage keys for offline/fallback
const LOCAL_ORDERS_KEY = 'tailor_orders';
const CLOUD_CHAT_KEY = 'bradwear_global_chat';
const GLOBAL_NOTIF_KEY = 'bradwear_global_notif';

// Convert local OrderItem to Supabase format
const toOrderDB = (order: OrderItem): Omit<OrderDB, 'id' | 'created_at' | 'updated_at'> & { id?: string } => ({
    id: order.cloudId,
    kode_barang: order.kodeBarang,
    nama_penjahit: order.namaPenjahit,
    model: order.model,
    model_detail: order.modelDetail || null,
    jumlah_pesanan: order.jumlahPesanan || 0,
    status: order.status,
    size_details: order.sizeDetails,
    cs: order.cs || null,
    konsumen: order.konsumen || null,
    warna: order.warna || null,
    tanggal_order: order.tanggalOrder || null,
    tanggal_target_selesai: order.tanggalTargetSelesai || null,
    saku_type: order.sakuType || null,
    saku_color: order.sakuColor || null,
    payment_status: order.paymentStatus || null,
    priority: order.priority || null,
    deskripsi_pekerjaan: order.deskripsiPekerjaan || null,
    embroidery_status: order.embroideryStatus || null,
    embroidery_notes: order.embroideryNotes || null,
    deleted_at: order.deletedAt || null
});

// Convert Supabase OrderDB to local format
const toOrderItem = (db: OrderDB): OrderItem => ({
    id: db.id || '',
    cloudId: db.id,
    kodeBarang: db.kode_barang,
    namaPenjahit: db.nama_penjahit,
    konsumen: db.konsumen || '',
    tanggalOrder: db.tanggal_order || db.created_at || new Date().toISOString(),
    tanggalTargetSelesai: db.tanggal_target_selesai || '',
    cs: db.cs || '',
    model: db.model,
    modelDetail: db.model_detail || undefined,
    warna: db.warna || '',
    sakuType: (db.saku_type as any) || 'Polos',
    sakuColor: (db.saku_color as any) || 'Hitam',
    jumlahPesanan: db.jumlah_pesanan,
    status: db.status as any,
    paymentStatus: db.payment_status as any || 'Belum Bayar',
    priority: (db.priority as any) || 'Medium',
    deskripsiPekerjaan: db.deskripsi_pekerjaan || '',
    sizeDetails: db.size_details || [],
    embroideryStatus: (db.embroidery_status as any) || 'Lengkap',
    embroideryNotes: db.embroidery_notes || '',
    createdAt: db.created_at || new Date().toISOString(),
    deletedAt: db.deleted_at || undefined
});

export const syncService = {
    // Pushes a local order to Supabase (public cloud)
    pushOrderToCloud: async (order: OrderItem): Promise<void> => {
        try {
            console.log('Pushing order to Supabase:', order.kodeBarang);
            const result = await supabaseService.upsertOrder(toOrderDB(order));
            if (result) {
                console.log('Order pushed successfully:', result);
                // Broadcast notification locally
                const notif = {
                    id: Math.random().toString(36).substr(2, 9),
                    sender: order.namaPenjahit,
                    kode: order.kodeBarang,
                    timestamp: new Date().toISOString()
                };
                localStorage.setItem(GLOBAL_NOTIF_KEY, JSON.stringify(notif));
                window.dispatchEvent(new Event('storage'));
            }
        } catch (e) {
            console.error("Sync Error:", e);
        }
    },

    // Check if code exists globally in Supabase
    checkDuplicateCode: async (kode: string): Promise<OrderItem | null> => {
        try {
            const results = await supabaseService.searchOrdersByCode(kode);
            if (results.length > 0) {
                return toOrderItem(results[0]);
            }
            return null;
        } catch (e) {
            console.error("Check duplicate error:", e);
            return null;
        }
    },

    // Searches across ALL shared orders in Supabase
    searchGlobalOrders: async (query: string): Promise<OrderItem[]> => {
        try {
            if (!query.trim()) return [];

            // Search by kode barang
            const byCode = await supabaseService.searchOrdersByCode(query);
            // Search by nama penjahit
            const byTailor = await supabaseService.searchOrdersByTailor(query);

            // Combine and deduplicate
            const combined = [...byCode, ...byTailor];
            const unique = combined.filter((item, index, self) =>
                index === self.findIndex(t => t.kode_barang === item.kode_barang)
            );

            return unique.map(toOrderItem);
        } catch (e) {
            console.error("Search error:", e);
            return [];
        }
    },

    // Migrates/Syncs all local orders to cloud (useful after updates)
    syncAllLocalToCloud: async (orders: OrderItem[]): Promise<void> => {
        console.log(`Starting background sync for ${orders.length} orders...`);
        // We do this in small batches or sequentially to avoid hitting rate limits
        for (const order of orders) {
            try {
                // Only sync if not deleted permanently or as a safety measure
                await syncService.pushOrderToCloud(order);
            } catch (err) {
                console.error(`Sync failed for order ${order.kodeBarang}:`, err);
            }
        }
        console.log("Background sync completed.");
    },

    // Get all global orders from Supabase
    getGlobalOrders: async (): Promise<OrderItem[]> => {
        try {
            const orders = await supabaseService.getGlobalOrders();
            return orders.map(toOrderItem);
        } catch (e) {
            console.error("Get global orders error:", e);
            return [];
        }
    },

    // Sends a message to the forum (legacy - now uses supabaseService directly)
    sendMessage: (msg: ChatMessage) => {
        try {
            const chatHistory = JSON.parse(localStorage.getItem(CLOUD_CHAT_KEY) || '[]');
            chatHistory.push(msg);
            localStorage.setItem(CLOUD_CHAT_KEY, JSON.stringify(chatHistory));
            window.dispatchEvent(new Event('storage'));
        } catch (e) {
            console.error("Chat Error:", e);
        }
    },

    // Fetches current chat history (legacy)
    getChatHistory: (): ChatMessage[] => {
        try {
            return JSON.parse(localStorage.getItem(CLOUD_CHAT_KEY) || '[]');
        } catch (e) {
            return [];
        }
    }
};
