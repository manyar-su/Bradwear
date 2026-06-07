import { OrderItem, ChatMessage } from '../types';
import { supabaseService, OrderDB, WorkItemDB } from './supabaseService';
import { getGroupKey } from '../utils/sizeGrouping';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale/id';

// Local storage keys for offline/fallback
const LOCAL_ORDERS_KEY = 'tailor_orders';
const CLOUD_CHAT_KEY = 'bradwear_global_chat';
const GLOBAL_NOTIF_KEY = 'bradwear_global_notif';
const GLOBAL_NOTIF_EVENT = 'bradwear-global-notif';
const OUTBOX_KEY = 'bradflow_sync_outbox';

type OutboxOperation =
    | { id: string; type: 'save'; order: OrderItem; createdAt: string }
    | { id: string; type: 'status'; cloudId: string; status: 'Proses' | 'Selesai'; createdAt: string };
type NewOutboxOperation =
    | { type: 'save'; order: OrderItem }
    | { type: 'status'; cloudId: string; status: 'Proses' | 'Selesai' };

const readOutbox = (): OutboxOperation[] => {
    try {
        const parsed = JSON.parse(localStorage.getItem(OUTBOX_KEY) || '[]');
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const queueOutbox = (operation: NewOutboxOperation) => {
    const outbox = readOutbox();
    outbox.push({ ...operation, id: crypto.randomUUID(), createdAt: new Date().toISOString() } as OutboxOperation);
    localStorage.setItem(OUTBOX_KEY, JSON.stringify(outbox));
};

const toWorkItems = (order: OrderItem): WorkItemDB[] => {
    const groups = new Map<string, WorkItemDB>();

    order.sizeDetails.forEach((detail, index) => {
        const key = getGroupKey(detail, order.jenisBarang);
        if (!groups.has(key)) {
            groups.set(key, {
                sort_order: groups.size,
                warna: detail.warna || order.warna,
                assigned_tailor_name: detail.namaPenjahit || undefined,
                candidate_tailor_name: detail.candidateTailorName,
                tailor_confirmation_status: detail.tailorConfirmationStatus || (detail.candidateTailorName ? 'needs_confirmation' : 'confirmed'),
                gender: detail.gender,
                tangan: detail.tangan,
                model: detail.model || order.model,
                item_attributes: {
                    sakuType: detail.sakuType,
                    sakuColor: detail.sakuColor,
                    bahanKemeja: detail.bahanKemeja,
                    modelCelana: detail.modelCelana,
                    bahanCelana: detail.bahanCelana,
                    modelRompi: detail.modelRompi,
                    jenisSakuRompi: detail.jenisSakuRompi,
                },
                pcs_total: 0,
                sizes: [],
            });
        }

        const group = groups.get(key)!;
        group.pcs_total += detail.jumlah || 0;
        group.sizes.push({
            sort_order: index,
            size: detail.size || '',
            quantity: detail.jumlah || 0,
            nama_per_size: detail.namaPerSize,
            is_custom_size: !!detail.isCustomSize,
            custom_measurements: detail.customMeasurements as Record<string, unknown> | undefined,
        });
    });

    return Array.from(groups.values());
};

const relationalSizeDetails = (db: OrderDB) => {
    if (!db.order_work_items?.length) return db.size_details || [];

    return [...db.order_work_items]
        .sort((a, b) => a.sort_order - b.sort_order)
        .flatMap(item => [...(item.order_work_item_sizes || [])]
            .sort((a, b) => a.sort_order - b.sort_order)
            .map(size => ({
                size: size.size,
                jumlah: size.quantity,
                namaPerSize: size.nama_per_size,
                isCustomSize: size.is_custom_size,
                customMeasurements: size.custom_measurements,
                warna: item.warna,
                namaPenjahit: item.assigned_tailor_name,
                candidateTailorName: item.candidate_tailor_name,
                tailorConfirmationStatus: item.tailor_confirmation_status,
                gender: item.gender || 'Pria',
                tangan: item.tangan || 'Pendek',
                model: item.model,
                ...(item.item_attributes || {}),
            })));
};

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
    completed_at: order.completedAt || null,
    deleted_at: order.deletedAt || null,
    owner_user_id: order.ownerUserId,
    source: order.source || (order.isManual ? 'manual' : 'scan'),
    scan_payload: order.scanPayload
});

// Convert Supabase OrderDB to local format
export const toOrderItem = (db: OrderDB): OrderItem => ({
    id: db.id || '',
    cloudId: db.id,
    kodeBarang: db.kode_barang,
    namaPenjahit: db.nama_penjahit,
    konsumen: db.konsumen || '',
    tanggalOrder: db.tanggal_order || (db.created_at ? format(new Date(db.created_at), 'd MMMM yyyy', { locale: idLocale }) : ''),
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
    sizeDetails: relationalSizeDetails(db),
    embroideryStatus: (db.embroidery_status as any) || 'Lengkap',
    embroideryNotes: db.embroidery_notes || '',
    completedAt: db.completed_at || null,
    createdAt: db.created_at || new Date().toISOString(),
    deletedAt: db.deleted_at || undefined,
    ownerUserId: db.owner_user_id,
    source: db.source,
    scanPayload: db.scan_payload,
    updatedAt: db.updated_at
});

export const syncService = {
    // Pushes a local order to Supabase (public cloud)
    pushOrderToCloud: async (order: OrderItem): Promise<OrderItem | null> => {
        if (!navigator.onLine) {
            queueOutbox({ type: 'save', order });
            return order;
        }
        try {
            console.log('Pushing order to Supabase:', order.kodeBarang);
            const user = await supabaseService.getCurrentUser();
            const orderWithOwner = { ...order, ownerUserId: order.ownerUserId || user?.id };
            const result = await supabaseService.saveOrderWithItems(toOrderDB(orderWithOwner), toWorkItems(orderWithOwner));
            if (result) {
                console.log('Order pushed successfully:', result);
                const updatedItem = toOrderItem(result);

                // Broadcast notification locally
                const notif = {
                    id: Math.random().toString(36).substr(2, 9),
                    sender: order.namaPenjahit,
                    kode: order.kodeBarang,
                    type: order.deletedAt ? 'DELETE' : 'UPDATE',
                    timestamp: new Date().toISOString()
                };
                localStorage.setItem(GLOBAL_NOTIF_KEY, JSON.stringify(notif));
                window.dispatchEvent(new CustomEvent(GLOBAL_NOTIF_EVENT, { detail: notif }));

                return updatedItem;
            }
            return null;
        } catch (e) {
            console.error("Sync Error:", e);
            queueOutbox({ type: 'save', order });
            return null;
        }
    },

    updateOrderStatus: async (order: OrderItem, status: 'Proses' | 'Selesai'): Promise<OrderItem | null> => {
        const cloudId = order.cloudId;
        const updatedOrder = {
            ...order,
            status: status as any,
            completedAt: status === 'Selesai' ? new Date().toISOString() : null,
        };
        if (!cloudId) {
            queueOutbox({ type: 'save', order: updatedOrder });
            return updatedOrder;
        }
        if (!navigator.onLine) {
            queueOutbox({ type: 'status', cloudId, status });
            return updatedOrder;
        }
        try {
            return toOrderItem(await supabaseService.updateOrderStatus(cloudId, status));
        } catch (error) {
            console.error('Status sync failed:', error);
            queueOutbox({ type: 'status', cloudId, status });
            return null;
        }
    },

    flushOutbox: async (): Promise<void> => {
        if (!navigator.onLine) return;
        const pending = readOutbox();
        const failed: OutboxOperation[] = [];

        for (const operation of pending) {
            try {
                if (operation.type === 'save') {
                    const user = await supabaseService.getCurrentUser();
                    const order = { ...operation.order, ownerUserId: operation.order.ownerUserId || user?.id };
                    await supabaseService.saveOrderWithItems(toOrderDB(order), toWorkItems(order));
                } else {
                    await supabaseService.updateOrderStatus(operation.cloudId, operation.status);
                }
            } catch {
                failed.push(operation);
            }
        }

        localStorage.setItem(OUTBOX_KEY, JSON.stringify(failed));
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

    getOrdersByTailor: async (namaPenjahit: string): Promise<OrderItem[]> => {
        try {
            const orders = await supabaseService.getOrdersByTailor(namaPenjahit);
            return orders.map(toOrderItem);
        } catch (e) {
            console.error("Get orders by tailor error:", e);
            return [];
        }
    },

    // Get deleted orders for a specific tailor
    getDeletedOrders: async (namaPenjahit: string): Promise<OrderItem[]> => {
        try {
            const orders = await supabaseService.getDeletedOrders(namaPenjahit);
            return orders.map(toOrderItem);
        } catch (e) {
            console.error("Get deleted orders error:", e);
            return [];
        }
    },

    // Delete an order permanently from Supabase
    deleteOrderPermanently: async (id: string): Promise<boolean> => {
        return supabaseService.deleteOrderPermanently(id);
    },

    // Sends a message to the forum (legacy - now uses supabaseService directly)
    sendMessage: (msg: ChatMessage) => {
        try {
            const chatHistory = JSON.parse(localStorage.getItem(CLOUD_CHAT_KEY) || '[]');
            chatHistory.push(msg);
            localStorage.setItem(CLOUD_CHAT_KEY, JSON.stringify(chatHistory));
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
    },

    // Subscribes to global order changes
    subscribeToGlobalOrders: (onChange: (order: OrderItem, event: 'INSERT' | 'UPDATE' | 'DELETE') => void) => {
        return supabaseService.subscribeToOrders((payload) => {
            if (payload.eventType === 'DELETE') {
                onChange({ id: payload.old.id } as OrderItem, 'DELETE');
            } else {
                onChange(toOrderItem(payload.new), payload.eventType);
            }
        });
    },

    unsubscribe: (channel: any) => {
        supabaseService.unsubscribe(channel);
    }
};
