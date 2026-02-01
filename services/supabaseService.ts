import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rcaqtzgmepyxgszcwldr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjYXF0emdtZXB5eGdzemN3bGRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODI1NzAsImV4cCI6MjA4NTQ1ODU3MH0.qviq6aHo5weaTN3_e6loWO1TZ6vlnDcN_jbkGwdja30';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Types
export interface ChatMessageDB {
    id?: string;
    sender: string;
    text: string;
    image?: string;
    created_at?: string;
}

export interface OnlineUserDB {
    id?: string;
    name: string;
    last_seen: string;
}

export interface OrderDB {
    id?: string;
    kode_barang: string;
    nama_penjahit: string;
    model: string;
    model_detail?: string;
    jumlah_pesanan: number;
    status: string;
    size_details: any;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
}

// Supabase Service
export const supabaseService = {
    // ============ CHAT MESSAGES ============
    async getChatMessages(): Promise<ChatMessageDB[]> {
        const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .order('created_at', { ascending: true })
            .limit(100);

        if (error) {
            console.error('Error fetching messages:', error);
            return [];
        }
        return data || [];
    },

    async sendMessage(message: Omit<ChatMessageDB, 'id' | 'created_at'>): Promise<ChatMessageDB | null> {
        console.log('Sending message to Supabase:', message);
        const { data, error } = await supabase
            .from('chat_messages')
            .insert([message])
            .select()
            .single();

        if (error) {
            console.error('Error sending message:', error);
            alert(`Gagal kirim pesan: ${error.message}`);
            return null;
        }
        console.log('Message sent successfully:', data);
        return data;
    },

    subscribeToChatMessages(callback: (message: ChatMessageDB) => void): RealtimeChannel {
        return supabase
            .channel('chat_messages_channel')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'chat_messages' },
                (payload) => {
                    callback(payload.new as ChatMessageDB);
                }
            )
            .subscribe();
    },

    // ============ ONLINE PRESENCE ============
    async updatePresence(name: string): Promise<void> {
        const { error } = await supabase
            .from('online_users')
            .upsert(
                { name, last_seen: new Date().toISOString() },
                { onConflict: 'name' }
            );

        if (error) {
            console.error('Error updating presence:', error);
        }
    },

    async removePresence(name: string): Promise<void> {
        const { error } = await supabase
            .from('online_users')
            .delete()
            .eq('name', name);

        if (error) {
            console.error('Error removing presence:', error);
        }
    },

    async getOnlineUsers(): Promise<OnlineUserDB[]> {
        const threshold = new Date(Date.now() - 30000).toISOString(); // 30 seconds ago
        const { data, error } = await supabase
            .from('online_users')
            .select('*')
            .gte('last_seen', threshold);

        if (error) {
            console.error('Error fetching online users:', error);
            return [];
        }
        return data || [];
    },

    subscribeToPresence(callback: () => void): RealtimeChannel {
        return supabase
            .channel('online_users_channel')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'online_users' },
                () => callback()
            )
            .subscribe();
    },

    // ============ ORDERS (GLOBAL) ============
    async getGlobalOrders(): Promise<OrderDB[]> {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
            return [];
        }
        return data || [];
    },

    async searchOrdersByCode(kodeBarang: string): Promise<OrderDB[]> {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .ilike('kode_barang', `%${kodeBarang}%`)
            .is('deleted_at', null);

        if (error) {
            console.error('Error searching orders:', error);
            return [];
        }
        return data || [];
    },

    async searchOrdersByTailor(namaPenjahit: string): Promise<OrderDB[]> {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .ilike('nama_penjahit', `%${namaPenjahit}%`)
            .is('deleted_at', null);

        if (error) {
            console.error('Error searching orders by tailor:', error);
            return [];
        }
        return data || [];
    },

    async upsertOrder(order: Omit<OrderDB, 'id' | 'created_at' | 'updated_at'>): Promise<OrderDB | null> {
        const { data, error } = await supabase
            .from('orders')
            .upsert([{ ...order, updated_at: new Date().toISOString() }],
                { onConflict: 'kode_barang' })
            .select()
            .single();

        if (error) {
            console.error('Error upserting order:', error);
            return null;
        }
        return data;
    },

    subscribeToOrders(callback: () => void): RealtimeChannel {
        return supabase
            .channel('orders_channel')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                () => callback()
            )
            .subscribe();
    },

    // ============ UNSUBSCRIBE ============
    unsubscribe(channel: RealtimeChannel): void {
        supabase.removeChannel(channel);
    }
};

export default supabaseService;
