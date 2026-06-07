import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

const SUPABASE_URL =
    import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://placeholder.supabase.co';
const SUPABASE_KEY =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    'placeholder-key';

if (
    (!import.meta.env.VITE_SUPABASE_URL && !import.meta.env.NEXT_PUBLIC_SUPABASE_URL) ||
    (!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY &&
        !import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
        !import.meta.env.VITE_SUPABASE_ANON_KEY)
) {
    console.warn('⚠️ Supabase env key/url is missing in .env');
}

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

const normalizeBradflowIdentity = (username: string) => {
    const trimmed = username.trim().toLowerCase();
    if (!trimmed) return null;

    if (trimmed.includes('@')) {
        const [localPart, domain] = trimmed.split('@');
        const cleanedLocalPart = (localPart || '').replace(/[^a-z0-9._-]/g, '');
        if (!cleanedLocalPart) return null;
        if (domain && domain !== 'bradflow.com') {
            throw new Error('Gunakan domain @bradflow.com.');
        }
        return {
            localPart: cleanedLocalPart,
            email: `${cleanedLocalPart}@bradflow.com`,
        };
    }

    const cleanedLocalPart = trimmed.replace(/[^a-z0-9._-]/g, '');
    if (!cleanedLocalPart) return null;
    return {
        localPart: cleanedLocalPart,
        email: `${cleanedLocalPart}@bradflow.com`,
    };
};

const getAuthErrorMessage = (error: unknown) => {
    const rawMessage = error instanceof Error ? error.message : String(error || '');
    const lowerMessage = rawMessage.toLowerCase();

    if (lowerMessage.includes('email rate limit exceeded') || lowerMessage.includes('email address rate limit')) {
        return 'Batas kirim email Supabase tercapai. Ini biasanya terjadi karena email confirmation masih aktif. Matikan email confirmation di Supabase Auth agar akun nama + PIN bisa langsung dipakai.';
    }

    if (lowerMessage.includes('invalid login credentials')) {
        return 'Nama atau PIN tidak cocok.';
    }

    if (lowerMessage.includes('user already registered')) {
        return 'Nama ini sudah terdaftar. Masuk saja dengan PIN yang sama.';
    }

    return rawMessage;
};

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
    cs?: string;
    konsumen?: string;
    warna?: string;
    tanggal_order?: string;
    tanggal_target_selesai?: string;
    saku_type?: string;
    saku_color?: string;
    payment_status?: string;
    priority?: string;
    deskripsi_pekerjaan?: string;
    embroidery_status?: string;
    embroidery_notes?: string;
    completed_at?: string | null;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
    owner_user_id?: string;
    source?: 'scan' | 'manual' | 'migration';
    scan_payload?: Record<string, unknown>;
    order_work_items?: Array<WorkItemDB & {
        id: string;
        order_id: string;
        order_work_item_sizes?: Array<WorkItemDB['sizes'][number] & { id: string }>;
    }>;
}

export interface WorkItemDB {
    sort_order: number;
    warna?: string;
    assigned_tailor_user_id?: string;
    assigned_tailor_name?: string;
    candidate_tailor_name?: string;
    tailor_confirmation_status: 'confirmed' | 'needs_confirmation' | 'not_tailor';
    gender?: string;
    tangan?: string;
    model?: string;
    item_attributes: Record<string, unknown>;
    pcs_total: number;
    sizes: Array<{
        sort_order: number;
        size: string;
        quantity: number;
        nama_per_size?: string;
        is_custom_size: boolean;
        custom_measurements?: Record<string, unknown>;
    }>;
}

// Supabase Service
export const supabaseService = {
    async getCurrentUser() {
        const { data } = await supabase.auth.getUser();
        return data.user || null;
    },

    async signUpCustomEmail(username: string, password: string) {
        const normalized = normalizeBradflowIdentity(username);
        if (!normalized) throw new Error('Nama akun tidak valid.');
        const result = await supabase.auth.signUp({
            email: normalized.email,
            password,
            options: { data: { display_name: normalized.localPart, role: 'penjahit' } }
        });
        if (result.error) {
            throw new Error(getAuthErrorMessage(result.error));
        }
        return result;
    },

    async signInCustomEmail(username: string, password: string) {
        const normalized = normalizeBradflowIdentity(username);
        if (!normalized) throw new Error('Nama akun tidak valid.');
        const result = await supabase.auth.signInWithPassword({ email: normalized.email, password });
        if (result.error) {
            throw new Error(getAuthErrorMessage(result.error));
        }
        return result;
    },

    async signOut() {
        return supabase.auth.signOut();
    },

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

    async deleteMessage(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('chat_messages')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting message:', error);
            return false;
        }
        return true;
    },

    subscribeToChatMessages(
        onInsert: (message: ChatMessageDB) => void,
        onDelete?: (id: string) => void
    ): RealtimeChannel {
        return supabase
            .channel('chat_messages_channel')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'chat_messages' },
                (payload) => {
                    onInsert(payload.new as ChatMessageDB);
                }
            )
            .on('postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'chat_messages' },
                (payload) => {
                    if (onDelete && payload.old && payload.old.id) {
                        onDelete(payload.old.id as string);
                    }
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
            .select('*, order_work_items(*, order_work_item_sizes(*))')
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
            return [];
        }
        return data || [];
    },

    async getOrdersByTailor(namaPenjahit: string): Promise<OrderDB[]> {
        const { data, error } = await supabase
            .from('orders')
            .select('*, order_work_items(*, order_work_item_sizes(*))')
            .is('deleted_at', null)
            .ilike('nama_penjahit', namaPenjahit.trim())
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching orders by tailor:', error);
            return [];
        }
        return data || [];
    },

    async getDeletedOrders(namaPenjahit: string): Promise<OrderDB[]> {
        const { data, error } = await supabase
            .from('orders')
            .select('*, order_work_items(*, order_work_item_sizes(*))')
            .not('deleted_at', 'is', null)
            .ilike('nama_penjahit', namaPenjahit)
            .order('deleted_at', { ascending: false });

        if (error) {
            console.error('Error fetching deleted orders:', error);
            return [];
        }
        return data || [];
    },

    async deleteOrderPermanently(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting order permanently:', error);
            return false;
        }
        return true;
    },

    async searchOrdersByCode(kodeBarang: string): Promise<OrderDB[]> {
        const { data, error } = await supabase
            .from('orders')
            .select('*, order_work_items(*, order_work_item_sizes(*))')
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
            .select('*, order_work_items(*, order_work_item_sizes(*))')
            .ilike('nama_penjahit', `%${namaPenjahit}%`)
            .is('deleted_at', null);

        if (error) {
            console.error('Error searching orders by tailor:', error);
            return [];
        }
        return data || [];
    },

    async upsertOrder(order: Omit<OrderDB, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<OrderDB | null> {
        try {
            let targetId = order.id;

            // Jika tidak ada ID, coba cari apakah sudah ada kode_barang + penjahit yang sama
            if (!targetId) {
                const { data: existing } = await supabase
                    .from('orders')
                    .select('id, nama_penjahit')
                    .eq('kode_barang', order.kode_barang)
                    .eq('nama_penjahit', order.nama_penjahit)
                    .maybeSingle();

                if (existing) {
                    targetId = existing.id;
                }
            } else {
                // Verifikasi kepemilikan jika ID disediakan
                const { data: existing } = await supabase
                    .from('orders')
                    .select('nama_penjahit')
                    .eq('id', targetId)
                    .maybeSingle();

                if (existing && existing.nama_penjahit.toLowerCase().trim() !== order.nama_penjahit.toLowerCase().trim()) {
                    console.warn(`Unauthorized update attempt for record ${targetId} by ${order.nama_penjahit}. Owner is ${existing.nama_penjahit}`);
                    return null;
                }
            }

            const { data, error } = await supabase
                .from('orders')
                .upsert({
                    ...order,
                    id: targetId,
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) {
                console.error('Error upserting order:', error);
                return null;
            }
            return data;
        } catch (e) {
            console.error('Upsert exception:', e);
            return null;
        }
    },

    async saveOrderWithItems(order: Omit<OrderDB, 'created_at' | 'updated_at'>, workItems: WorkItemDB[]): Promise<OrderDB | null> {
        const { data, error } = await supabase.rpc('save_order_with_items', {
            p_order: order,
            p_work_items: workItems
        });

        if (error) {
            console.error('Error saving relational order:', error);
            throw error;
        }
        return data as OrderDB;
    },

    async updateOrderStatus(id: string, status: 'Proses' | 'Selesai'): Promise<OrderDB> {
        const { data, error } = await supabase.rpc('update_order_status', {
            p_order_id: id,
            p_status: status,
            p_source_app: 'bradflow'
        });

        if (error) throw error;
        return data as OrderDB;
    },

    subscribeToOrders(callback: (payload: any) => void): RealtimeChannel {
        return supabase
            .channel('orders_global_sync')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                (payload) => callback(payload)
            )
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'order_work_items' },
                async (payload) => {
                    const orderId = (payload.new as any)?.order_id || (payload.old as any)?.order_id;
                    if (!orderId) return;
                    const { data } = await supabase
                        .from('orders')
                        .select('*, order_work_items(*, order_work_item_sizes(*))')
                        .eq('id', orderId)
                        .maybeSingle();
                    if (data) callback({ eventType: 'UPDATE', new: data });
                }
            )
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'order_work_item_sizes' },
                async (payload) => {
                    const workItemId = (payload.new as any)?.work_item_id || (payload.old as any)?.work_item_id;
                    if (!workItemId) return;
                    const { data: workItem } = await supabase
                        .from('order_work_items')
                        .select('order_id')
                        .eq('id', workItemId)
                        .maybeSingle();
                    if (!workItem?.order_id) return;
                    const { data } = await supabase
                        .from('orders')
                        .select('*, order_work_items(*, order_work_item_sizes(*))')
                        .eq('id', workItem.order_id)
                        .maybeSingle();
                    if (data) callback({ eventType: 'UPDATE', new: data });
                }
            )
            .subscribe();
    },

    // ============ UNSUBSCRIBE ============
    unsubscribe(channel: RealtimeChannel): void {
        supabase.removeChannel(channel);
    }
};

export default supabaseService;
