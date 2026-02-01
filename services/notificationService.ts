import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { OrderItem, JobStatus } from '../types';
import { differenceInDays, parse, isValid } from 'date-fns';

const NOTIFICATION_CHANNEL_ID = 'bradflow_deadline';

// Parse Indonesian date format "d MMMM yyyy" or ISO string
const parseDeadline = (dateStr: string): Date | null => {
    if (!dateStr) return null;

    // Try ISO format first
    let date = new Date(dateStr);
    if (isValid(date)) return date;

    // Try Indonesian format: "1 Februari 2026"
    const INDO_MONTHS: Record<string, number> = {
        'januari': 0, 'februari': 1, 'maret': 2, 'april': 3, 'mei': 4, 'juni': 5,
        'juli': 6, 'agustus': 7, 'september': 8, 'oktober': 9, 'november': 10, 'desember': 11
    };

    const parts = dateStr.toLowerCase().split(' ');
    if (parts.length >= 3) {
        const day = parseInt(parts[0]);
        const month = INDO_MONTHS[parts[1]];
        const year = parseInt(parts[2]);
        if (!isNaN(day) && month !== undefined && !isNaN(year)) {
            return new Date(year, month, day);
        }
    }

    return null;
};

export const notificationService = {
    // Initialize notification channel (Android)
    async init(): Promise<void> {
        try {
            // Request permission
            const permResult = await LocalNotifications.requestPermissions();
            console.log('Notification permission:', permResult);

            // Create notification channel for Android
            await LocalNotifications.createChannel({
                id: NOTIFICATION_CHANNEL_ID,
                name: 'Deadline Reminder',
                description: 'Notifikasi pengingat deadline order',
                importance: 5, // Max importance
                visibility: 1,
                vibration: true,
                sound: 'default'
            });

            console.log('Notification service initialized');
        } catch (e) {
            console.error('Failed to init notifications:', e);
        }
    },

    // Check orders and schedule notifications for orders with 1 day left
    async checkAndNotify(orders: OrderItem[], currentUserName: string): Promise<void> {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Filter orders:
            // 1. Belongs to current user (namaPenjahit matches)
            // 2. Status is PROSES (not completed)
            // 3. Has deadline within 1 day
            const urgentOrders = orders.filter(order => {
                if (order.deletedAt) return false;
                if (order.status !== JobStatus.PROSES) return false;
                if (order.namaPenjahit.toLowerCase() !== currentUserName.toLowerCase()) return false;

                const deadline = parseDeadline(order.tanggalTargetSelesai);
                if (!deadline) return false;

                const daysLeft = differenceInDays(deadline, today);
                return daysLeft === 1; // Exactly 1 day left
            });

            if (urgentOrders.length === 0) {
                console.log('No urgent orders to notify');
                return;
            }

            // Cancel existing notifications first
            await LocalNotifications.cancel({ notifications: urgentOrders.map((_, i) => ({ id: 1000 + i })) });

            // Schedule notifications for each urgent order
            const notifications: ScheduleOptions = {
                notifications: urgentOrders.map((order, index) => ({
                    id: 1000 + index,
                    title: `⏰ Deadline Besok!`,
                    body: `Order ${order.kodeBarang} - ${order.model} (${order.jumlahPesanan} PCS) harus selesai BESOK!`,
                    channelId: NOTIFICATION_CHANNEL_ID,
                    schedule: { at: new Date(Date.now() + 1000) }, // Show immediately
                    sound: 'default',
                    smallIcon: 'ic_launcher',
                    largeIcon: 'ic_launcher',
                    actionTypeId: '',
                    extra: {
                        orderId: order.id,
                        kodeBarang: order.kodeBarang
                    }
                }))
            };

            await LocalNotifications.schedule(notifications);
            console.log(`Scheduled ${urgentOrders.length} deadline notifications`);

        } catch (e) {
            console.error('Failed to check and notify:', e);
        }
    },

    // Schedule a single notification
    async scheduleNotification(title: string, body: string, delayMs: number = 0): Promise<void> {
        try {
            await LocalNotifications.schedule({
                notifications: [{
                    id: Math.floor(Math.random() * 10000),
                    title,
                    body,
                    channelId: NOTIFICATION_CHANNEL_ID,
                    schedule: { at: new Date(Date.now() + delayMs) },
                    sound: 'default',
                    smallIcon: 'ic_launcher'
                }]
            });
        } catch (e) {
            console.error('Failed to schedule notification:', e);
        }
    },

    // Cancel all notifications
    async cancelAll(): Promise<void> {
        try {
            const pending = await LocalNotifications.getPending();
            if (pending.notifications.length > 0) {
                await LocalNotifications.cancel({ notifications: pending.notifications });
            }
        } catch (e) {
            console.error('Failed to cancel notifications:', e);
        }
    }
};

export default notificationService;
