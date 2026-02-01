
import { OrderItem, ChatMessage } from '../types';

// In a real app, these would be calls to a Firebase/Supabase backend.
// We simulate the "Cloud" using a special localStorage key.
const CLOUD_ORDERS_KEY = 'bradwear_global_orders';
const CLOUD_CHAT_KEY = 'bradwear_global_chat';
const GLOBAL_NOTIF_KEY = 'bradwear_global_notif';

export const syncService = {
    // Pushes a local order to the "Global" store
    pushOrderToCloud: (order: OrderItem) => {
        try {
            const globalOrders: OrderItem[] = JSON.parse(localStorage.getItem(CLOUD_ORDERS_KEY) || '[]');
            const exists = globalOrders.find((o: OrderItem) => o.id === order.id);
            if (!exists) {
                if (!order.deletedAt) {
                    globalOrders.push(order);
                    localStorage.setItem(CLOUD_ORDERS_KEY, JSON.stringify(globalOrders));

                    // Broadcast notification
                    const notif = {
                        id: Math.random().toString(36).substr(2, 9),
                        sender: order.namaPenjahit,
                        kode: order.kodeBarang,
                        timestamp: new Date().toISOString()
                    };
                    localStorage.setItem(GLOBAL_NOTIF_KEY, JSON.stringify(notif));
                    window.dispatchEvent(new Event('storage'));
                }
            }
        } catch (e) {
            console.error("Sync Error:", e);
        }
    },

    // Check if code exists globally
    checkDuplicateCode: (kode: string): OrderItem | null => {
        try {
            const globalOrders: OrderItem[] = JSON.parse(localStorage.getItem(CLOUD_ORDERS_KEY) || '[]');
            return globalOrders.find(o => o.kodeBarang === kode && !o.deletedAt) || null;
        } catch (e) {
            return null;
        }
    },

    // Searches across ALL shared orders
    searchGlobalOrders: async (query: string): Promise<OrderItem[]> => {
        try {
            if (!query.trim()) return [];
            const globalOrders: OrderItem[] = JSON.parse(localStorage.getItem(CLOUD_ORDERS_KEY) || '[]');
            const results = globalOrders.filter(o =>
                o.kodeBarang.toLowerCase().includes(query.toLowerCase()) ||
                o.namaPenjahit.toLowerCase().includes(query.toLowerCase()) ||
                o.konsumen.toLowerCase().includes(query.toLowerCase())
            );
            return results;
        } catch (e) {
            return [];
        }
    },

    // Sends a message to the forum
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

    // Fetches current chat history
    getChatHistory: (): ChatMessage[] => {
        try {
            return JSON.parse(localStorage.getItem(CLOUD_CHAT_KEY) || '[]');
        } catch (e) {
            return [];
        }
    }
};
