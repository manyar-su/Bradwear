
import { OrderItem, ChatMessage } from '../types';
import { supabaseService, OrderDB } from './supabaseService';

// Local storage keys for offline/fallback
const LOCAL_ORDERS_KEY = 'tailor_orders';
const CLOUD_CHAT_KEY = 'bradwear_global_chat';
const GLOBAL_NOTIF_KEY = 'bradwear_global_notif';

// Convert local OrderItem to Supabase format
const toOrderDB = (order: OrderItem): Omit<OrderDB, 'id' | 'created_at' | 'updated_at'> => ({
    kode_barang: order.kodeBarang,
    nama_penjahit: order.namaPenjahit,
    model: order.model,
    model_detail: order.modelDetail || null,
    jumlah_pesanan: order.jumlahPesanan,
    status: order.status,
    size_details: order.sizeDetails,
    deleted_at: order.deletedAt || null
});

// Convert Supabase OrderDB to local format
const toOrderItem = (db: OrderDB): OrderItem => ({
    id: db.id || '',
    kodeBarang: db.kode_barang,
    namaPenjahit: db.nama_penjahit,
    konsumen: '',
    tanggalOrder: db.created_at || new Date().toISOString(),
    tanggalTargetSelesai: '',
    cs: '',
    model: db.model,
    modelDetail: db.model_detail || undefined,
    warna: '',
    sakuType: 'Polos' as any,
    sakuColor: 'Hitam' as any,
    jumlahPesanan: db.jumlah_pesanan,
    status: db.status as any,
    priority: 'Medium' as any,
    deskripsiPekerjaan: '',
    sizeDetails: db.size_details || [],
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
