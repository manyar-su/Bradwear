
import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile, Trash2, Copy, X, Check, Package, AlertTriangle, PlusCircle, Users, Wifi, WifiOff, Camera, Image as ImageIcon, History, MessageSquare, Sparkles, Mic, Square, Play, Pause, Search, Loader2 } from 'lucide-react';
import { ChatMessage, OrderItem, JobStatus } from '../types';
import { syncService } from '../services/syncService';
import { supabaseService, ChatMessageDB, OnlineUserDB } from '../services/supabaseService';
import { notificationService } from '../services/notificationService';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale/id';
import { RealtimeChannel } from '@supabase/supabase-js';

const HEARTBEAT_INTERVAL = 10000; // 10 seconds

interface OnlineUser {
    name: string;
    lastSeen: string;
}

interface ChatScreenProps {
    isDarkMode: boolean;
    onBack?: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ isDarkMode, onBack }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [profileName, setProfileName] = useState(() => localStorage.getItem('profileName') || 'Nama Anda');
    const [showShareOptions, setShowShareOptions] = useState(false);
    const [showHistoryPopup, setShowHistoryPopup] = useState(false);
    const [historyOrders, setHistoryOrders] = useState<OrderItem[]>([]);
    const [selectedHistoryOrder, setSelectedHistoryOrder] = useState<OrderItem | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const [showOnlineList, setShowOnlineList] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [inspectOrder, setInspectOrder] = useState<OrderItem | null>(null);
    const [orderSearchQuery, setOrderSearchQuery] = useState('');
    const [isSearchingOrders, setIsSearchingOrders] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const EMOJIS = [
        "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "🥲", "🥹",
        "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗",
        "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓",
        "😎", "🥸", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕",
        "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤",
        "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰",
        "😥", "😓", "🤗", "🤔", "🫣", "🤭", "🫡", "🤫", "🫠", "🤥",
        "😶", "🫥", "😐", "YX", "😬", "🙄", "😯", "😦", "😧", "😮",
        "😲", "🥱", "😴", "🤤", "😪", "😵", "😵‍💫", "zip", "🥴", "ause",
        "👍", "👎", "👊", "✊", "vk", "🤝", "🙏", "💪", "🫶", "❤️"
    ];

    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const chatChannelRef = useRef<RealtimeChannel | null>(null);
    const presenceChannelRef = useRef<RealtimeChannel | null>(null);

    // Load chat messages from Supabase
    const loadMessages = async () => {
        try {
            const msgs = await supabaseService.getChatMessages();
            const currentName = localStorage.getItem('profileName') || 'Nama Anda';
            setMessages(msgs.map(m => ({
                id: m.id || '',
                sender: m.sender,
                text: m.text || '',
                image: m.image,
                timestamp: m.created_at || new Date().toISOString(),
                isMe: m.sender === currentName
            })));
            setIsConnected(true);
        } catch (e) {
            console.error('Failed to load messages:', e);
            setIsConnected(false);
        }
    };

    // Load online users from Supabase
    const loadOnlineUsers = async () => {
        try {
            const users = await supabaseService.getOnlineUsers();
            setOnlineUsers(users.map(u => ({
                name: u.name,
                lastSeen: u.last_seen
            })));
        } catch (e) {
            console.error('Failed to load online users:', e);
        }
    };

    // Supabase real-time subscriptions
    useEffect(() => {
        const currentName = localStorage.getItem('profileName') || 'Nama Anda';
        setProfileName(currentName);

        // Initial load
        loadMessages();
        loadOnlineUsers();

        // Subscribe to new messages
        chatChannelRef.current = supabaseService.subscribeToChatMessages(
            (newMsg) => {
                const messageMe = newMsg.sender === currentName;
                setMessages(prev => [...prev, {
                    id: newMsg.id || '',
                    sender: newMsg.sender,
                    text: newMsg.text || '',
                    image: newMsg.image,
                    timestamp: newMsg.created_at || new Date().toISOString(),
                    isMe: messageMe
                }]);

                // Show notification if NOT from me
                if (!messageMe) {
                    notificationService.showChatNotification(
                        newMsg.sender,
                        newMsg.text || (newMsg.image ? '📸 Mengirim Gambar' : 'Pesan Baru')
                    );
                }
            },
            (deletedId) => {
                setMessages(prev => prev.filter(msg => msg.id !== deletedId));
            }
        );

        // Subscribe to presence changes
        presenceChannelRef.current = supabaseService.subscribeToPresence(() => {
            loadOnlineUsers();
        });

        // Heartbeat for presence
        supabaseService.updatePresence(currentName);
        const heartbeat = setInterval(() => {
            supabaseService.updatePresence(currentName);
        }, HEARTBEAT_INTERVAL);

        // Cleanup
        return () => {
            clearInterval(heartbeat);
            supabaseService.removePresence(currentName);
            if (chatChannelRef.current) {
                supabaseService.unsubscribe(chatChannelRef.current);
            }
            if (presenceChannelRef.current) {
                supabaseService.unsubscribe(presenceChannelRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'profileName') {
                setProfileName(localStorage.getItem('profileName') || 'Nama Anda');
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const loadHistory = () => {
        const saved = localStorage.getItem('tailor_orders');
        if (saved) {
            const all = JSON.parse(saved) as OrderItem[];
            setHistoryOrders(all.filter(o => !o.deletedAt).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }
    };

    const handleOrderSearch = async (query: string) => {
        setOrderSearchQuery(query);
        if (query.length < 2) {
            loadHistory();
            return;
        }

        setIsSearchingOrders(true);
        try {
            const results = await syncService.searchGlobalOrders(query);
            setHistoryOrders(results);
        } catch (e) {
            console.error('Order search failed:', e);
        } finally {
            setIsSearchingOrders(false);
        }
    };

    const handleSendMessage = async (textOverride?: string, imageBase64?: string) => {
        const finalContent = textOverride || inputText.trim();
        if (!finalContent && !imageBase64) return;

        setIsSending(true);
        try {
            await supabaseService.sendMessage({
                sender: profileName,
                text: finalContent,
                image: imageBase64
            });
            if (!textOverride) setInputText('');
            setShowEmojiPicker(false);
        } catch (e) {
            console.error('Failed to send message:', e);
        } finally {
            setIsSending(false);
        }
    };

    const handleDeleteMessage = async (id: string) => {
        if (!confirm('Hapus pesan ini?')) return;

        try {
            const success = await supabaseService.deleteMessage(id);
            if (success) {
                setMessages(prev => prev.filter(m => m.id !== id));
                setSelectedMessageId(null);
            }
        } catch (e) {
            console.error('Failed to delete message:', e);
            alert('Gagal menghapus pesan');
        }
    };

    const handleCopyMessage = (text: string) => {
        navigator.clipboard.writeText(text);
        setSelectedMessageId(null);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64Audio = reader.result as string;
                    // Tag audio with a prefix (or just use mimetype detection)
                    // We'll trust the mimetype in the base64 string
                    handleSendMessage('', base64Audio);
                };
                reader.readAsDataURL(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (e) {
            console.error('Error accessing microphone:', e);
            alert('Gagal mengakses mikrofon. Pastikan izin diberikan.');
        }
    };

    const stopRecording = (shouldSend: boolean) => {
        if (mediaRecorderRef.current && isRecording) {
            if (shouldSend) {
                mediaRecorderRef.current.stop();
            } else {
                mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            }
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleSendMessage('', reader.result as string);
                setShowShareOptions(false);
                e.target.value = '';
            };
            reader.readAsDataURL(file);
        }
    };

    const handleShareHistory = () => {
        if (!selectedHistoryOrder) return;
        // Use a hidden prefix for special formatting
        handleSendMessage(`__ORDER_SHARE__:${JSON.stringify(selectedHistoryOrder)}`);
        setShowHistoryPopup(false);
        setSelectedHistoryOrder(null);
    };


    return (
        <div className={`flex flex-col h-full animate-in fade-in duration-500 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileUpload} />
            <input type="file" ref={cameraInputRef} hidden accept="image/*" capture="environment" onChange={handleFileUpload} />

            {/* Header */}
            <div className={`p-6 flex justify-between items-center border-b backdrop-blur-md sticky top-0 z-40 ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-100'}`}>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20 text-white relative">
                        <MessageSquare size={24} />
                        {isConnected && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                        )}
                    </div>
                    <div>
                        <h2 className={`text-lg font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Bradwear Team</h2>
                        <button
                            onClick={() => setShowOnlineList(!showOnlineList)}
                            className="text-[10px] font-black uppercase text-emerald-500 tracking-widest flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                        >
                            {isConnected ? (
                                <Wifi size={10} className="text-green-500" />
                            ) : (
                                <WifiOff size={10} className="text-red-500" />
                            )}
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <Users size={10} />
                            <span>{onlineUsers.length} Online</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Online Users Dropdown */}
            {showOnlineList && (
                <div className={`mx-6 mb-4 p-4 rounded-2xl border animate-in slide-in-from-top-2 duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-lg'}`}>
                    <div className="flex items-center justify-between mb-3">
                        <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            Penjahit Aktif ({onlineUsers.length})
                        </p>
                        <button onClick={() => setShowOnlineList(false)} className="text-slate-400 hover:text-red-500">
                            <X size={14} />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {onlineUsers.map((user, idx) => (
                            <div
                                key={idx}
                                className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 ${user.name === profileName
                                    ? 'bg-emerald-500 text-white'
                                    : isDarkMode
                                        ? 'bg-slate-800 text-slate-300'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                {user.name === profileName ? 'Anda' : user.name}
                            </div>
                        ))}
                        {onlineUsers.length === 0 && (
                            <p className="text-[10px] text-slate-400 italic">Tidak ada yang online</p>
                        )}
                    </div>
                </div>
            )}

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-32">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-20 text-center gap-4">
                        <Sparkles size={64} />
                        <p className="text-sm font-black uppercase tracking-widest">Kolaborasi antar penjahit dimulai di sini</p>
                    </div>
                ) : messages.map((msg, i) => (
                    <div key={msg.id} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`} style={{ animationDelay: `${i * 50}ms` }}>
                        <div
                            onClick={() => setSelectedMessageId(selectedMessageId === msg.id ? null : msg.id)}
                            className={`relative max-w-[85%] ${msg.image ? 'p-1.5' : 'px-5 py-3.5'} rounded-[2rem] border shadow-sm text-sm font-bold leading-relaxed cursor-pointer transition-all ${selectedMessageId === msg.id ? 'ring-2 ring-blue-400 ring-offset-2' : ''
                                } ${msg.isMe
                                    ? 'bg-emerald-500 text-white rounded-tr-none border-emerald-400/20'
                                    : isDarkMode
                                        ? 'bg-slate-800 text-white border-slate-700 rounded-tl-none'
                                        : 'bg-white text-slate-800 border-slate-100 rounded-tl-none'}`}>

                            {/* Message Options Overlay */}
                            {selectedMessageId === msg.id && (
                                <div className={`absolute -top-12 ${msg.isMe ? 'right-0' : 'left-0'} flex gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-200 z-10`}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteMessage(msg.id); }}
                                        className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                                        title="Hapus"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    {msg.text && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleCopyMessage(msg.text); }}
                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg transition-colors"
                                            title="Salin"
                                        >
                                            <Copy size={16} />
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setSelectedMessageId(null); }}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 rounded-lg"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}

                            {msg.text?.startsWith('__ORDER_SHARE__:') ? (() => {
                                try {
                                    const order = JSON.parse(msg.text.replace('__ORDER_SHARE__:', '')) as OrderItem;
                                    return (
                                        <div className="flex flex-col gap-3 min-w-[220px]">
                                            <div className="flex items-center gap-2 mb-1 pb-2 border-b border-white/10">
                                                <Package size={14} className={msg.isMe ? 'text-white' : 'text-emerald-500'} />
                                                <span className="text-[9px] font-black uppercase tracking-widest opacity-80">Rincian Pesanan</span>
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className={`flex justify-between items-center p-2 rounded-xl ${msg.isMe ? 'bg-black/10' : 'bg-slate-100 dark:bg-slate-900/50'}`}>
                                                    <span className="text-[7px] uppercase font-black opacity-50">Kode</span>
                                                    <span className="text-[10px] font-black tracking-tight">{order.kodeBarang}</span>
                                                </div>
                                                <div className={`flex justify-between items-center p-2 rounded-xl ${msg.isMe ? 'bg-black/10' : 'bg-slate-100 dark:bg-slate-900/50'}`}>
                                                    <span className="text-[7px] uppercase font-black opacity-50">Penjahit</span>
                                                    <span className="text-[10px] font-black">{order.namaPenjahit}</span>
                                                </div>
                                                <div className={`flex justify-between items-center p-2 rounded-xl ${msg.isMe ? 'bg-black/10' : 'bg-slate-100 dark:bg-slate-900/50'}`}>
                                                    <span className="text-[7px] uppercase font-black opacity-50">CS Admin</span>
                                                    <span className="text-[10px] font-black">{order.cs || '-'}</span>
                                                </div>
                                                <div className={`flex justify-between items-center p-2 rounded-xl ${msg.isMe ? 'bg-black/10' : 'bg-slate-100 dark:bg-slate-900/50'}`}>
                                                    <span className="text-[7px] uppercase font-black opacity-50">Konsumen</span>
                                                    <span className="text-[10px] font-black truncate max-w-[100px] text-right">{order.konsumen || '-'}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setInspectOrder(order); }}
                                                className={`w-full py-3 rounded-[1.2rem] font-black uppercase text-[9px] tracking-[0.1em] transition-all shadow-sm active:scale-95 ${msg.isMe ? 'bg-white text-emerald-600' : 'bg-emerald-500 text-white'}`}
                                            >
                                                Lihat Lengkap
                                            </button>
                                        </div>
                                    );
                                } catch (e) {
                                    return <div className="text-[10px] italic opacity-50 flex items-center gap-2"><AlertTriangle size={12} /> Gagal memuat data</div>;
                                }
                            })() : (
                                <>
                                    {msg.image && !msg.image.startsWith('data:audio') && (
                                        <img src={msg.image} alt="Shared" className="w-full h-auto rounded-[1.5rem] mb-2 max-h-64 object-cover" />
                                    )}
                                    {msg.text && (
                                        <div className={msg.image ? 'px-3 pb-2 break-words' : 'break-words'}>
                                            {msg.text.split('\n').map((line, idx) => (
                                                <div key={idx} className={line.startsWith('📍') || line.startsWith('*') ? 'text-[10px] italic font-bold opacity-90' : ''}>{line}</div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}

                            {msg.image && msg.image.startsWith('data:audio') && (
                                <div className="min-w-[200px] flex items-center gap-2 p-2" onClick={(e) => e.stopPropagation()}>
                                    <audio controls src={msg.image} className="h-8 w-full max-w-[200px]" />
                                </div>
                            )}

                            <div className={`text-[8px] mt-2 opacity-80 font-black uppercase flex items-center gap-2 ${msg.isMe ? 'text-white justify-end' : 'text-slate-400 justify-start'}`}>
                                <span className="tracking-tighter">{msg.sender}</span>
                                <span className="w-0.5 h-0.5 rounded-full bg-current opacity-30" />
                                <span>{format(new Date(msg.timestamp), 'HH:mm')}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* History Popup (Now Global Search) */}
            {showHistoryPopup && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className={`relative w-full max-w-sm rounded-[3rem] p-8 shadow-2xl flex flex-col max-h-[80vh] ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}`}>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-black">Cari Kode Barang</h3>
                                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Database Bradwear Team</p>
                            </div>
                            <button onClick={() => { setShowHistoryPopup(false); setOrderSearchQuery(''); }} className="text-slate-400 hover:text-red-500"><X size={24} /></button>
                        </div>

                        <div className="relative mb-4">
                            <input
                                type="text"
                                placeholder="Masukkan Kode Barang..."
                                value={orderSearchQuery}
                                onChange={(e) => handleOrderSearch(e.target.value)}
                                className={`w-full py-4 pl-12 pr-4 rounded-2xl text-[11px] font-black uppercase outline-none transition-all border ${isDarkMode ? 'bg-slate-800 border-slate-700 focus:border-emerald-500' : 'bg-slate-50 border-slate-100 focus:border-emerald-500 shadow-inner'}`}
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                {isSearchingOrders ? <Loader2 size={16} className="animate-spin text-emerald-500" /> : <Search size={16} />}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-3">
                            {historyOrders.length === 0 ? (
                                <div className="py-10 text-center opacity-30 italic text-[10px]">Data tidak ditemukan</div>
                            ) : historyOrders.map(o => (
                                <button key={o.id} onClick={() => setSelectedHistoryOrder(o)} className={`w-full p-4 rounded-3xl border text-left flex justify-between items-center transition-all ${selectedHistoryOrder?.id === o.id ? 'border-emerald-500 bg-emerald-500/10' : isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                                    <div className="flex-1 min-w-0 pr-2">
                                        <p className="text-[10px] font-black text-emerald-500 mb-1 truncate">{o.kodeBarang}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">PJ: {o.namaPenjahit}</p>
                                    </div>
                                    {selectedHistoryOrder?.id === o.id && <Check size={18} className="text-emerald-500" />}
                                </button>
                            ))}
                        </div>
                        <button onClick={handleShareHistory} disabled={!selectedHistoryOrder} className="w-full py-4 mt-6 bg-emerald-500 text-white rounded-2xl font-black uppercase text-xs disabled:opacity-50">Kirim ke Team</button>
                    </div>
                </div>
            )}

            {/* Inspect Order Popup */}
            {inspectOrder && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className={`relative w-full max-w-sm rounded-[3rem] p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto no-scrollbar ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
                                    <Package size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black tracking-tight">{inspectOrder.kodeBarang}</h3>
                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Detail Lengkap Pesanan</p>
                                </div>
                            </div>
                            <button onClick={() => setInspectOrder(null)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><X size={24} /></button>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className={`p-4 rounded-3xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Model</p>
                                    <p className="text-xs font-black">{inspectOrder.model}</p>
                                </div>
                                <div className={`p-4 rounded-3xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Warna</p>
                                    <p className="text-xs font-black">{inspectOrder.warna}</p>
                                </div>
                            </div>

                            <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                                <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Rincian Size</h5>
                                <table className="w-full text-[10px]">
                                    <thead>
                                        <tr className="text-slate-400 opacity-60">
                                            <th className="text-left pb-3 uppercase font-black">Size</th>
                                            <th className="text-center pb-3 uppercase font-black">Qty</th>
                                            <th className="text-right pb-3 uppercase font-black">Lengan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200/5">
                                        {inspectOrder.sizeDetails.map((sd, i) => (
                                            <tr key={i}>
                                                <td className="py-3 font-black uppercase">{sd.size}</td>
                                                <td className="py-3 text-center font-black text-emerald-500">{sd.jumlah}</td>
                                                <td className="py-3 text-right font-bold text-slate-400">{sd.tangan}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400 font-bold">Nama CS (Admin)</span>
                                    <span className="font-black">{inspectOrder.cs || '-'}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400 font-bold">Nama Konsumen</span>
                                    <span className="font-black">{inspectOrder.konsumen || '-'}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400 font-bold">Penjahit</span>
                                    <span className="font-black text-emerald-500">{inspectOrder.namaPenjahit}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setInspectOrder(null)}
                            className="w-full py-4 mt-8 bg-slate-900 dark:bg-emerald-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all"
                        >
                            Tutup Detail
                        </button>
                    </div>
                </div>
            )}

            {/* Share Options Panel */}
            {showShareOptions && (
                <div className="px-6 py-4 flex gap-4 animate-in slide-in-from-bottom-4 duration-300">
                    <button onClick={() => cameraInputRef.current?.click()} className="flex-1 p-4 rounded-3xl bg-slate-100 flex flex-col items-center gap-2 border border-slate-200">
                        <div className="p-3 bg-blue-500 rounded-2xl text-white shadow-md"><Camera size={20} /></div>
                        <span className="text-[9px] font-black uppercase">Kamera</span>
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex-1 p-4 rounded-3xl bg-slate-100 flex flex-col items-center gap-2 border border-slate-200">
                        <div className="p-3 bg-amber-500 rounded-2xl text-white shadow-md"><ImageIcon size={20} /></div>
                        <span className="text-[9px] font-black uppercase">Galeri</span>
                    </button>
                    <button onClick={() => { loadHistory(); setShowHistoryPopup(true); setShowShareOptions(false); }} className="flex-1 p-4 rounded-3xl bg-slate-100 flex flex-col items-center gap-2 border border-slate-200">
                        <div className="p-3 bg-purple-500 rounded-2xl text-white shadow-md"><Package size={20} /></div>
                        <span className="text-[9px] font-black uppercase">Kode Barang</span>
                    </button>
                </div>
            )}

            {/* Input Area */}
            <div className={`p-4 pb-12 border-t sticky bottom-0 z-30 transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]'}`}>
                {/* Emoji Picker */}
                {showEmojiPicker && (
                    <div className={`absolute bottom-full left-4 mb-4 p-4 rounded-3xl shadow-xl w-72 h-64 overflow-y-auto no-scrollbar grid grid-cols-6 gap-2 animate-in slide-in-from-bottom-5 zoom-in-90 duration-200 border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                        {EMOJIS.map((emoji, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setInputText(prev => prev + emoji);
                                    // Don't close immediately to allow multi-select
                                }}
                                className="text-xl hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-xl transition-colors"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}

                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="relative flex items-center gap-3">
                    <button type="button" onClick={() => setShowShareOptions(!showShareOptions)} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${showShareOptions ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500'}`}>
                        {showShareOptions ? <X size={20} /> : <PlusCircle size={24} />}
                    </button>

                    <div className={`flex-1 flex items-center gap-2 h-12 px-4 rounded-2xl border transition-all overflow-hidden ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100 shadow-inner'}`}>
                        {isRecording ? (
                            <div className="flex-1 flex items-center justify-between animate-in fade-in duration-200">
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                    </span>
                                    <span className="text-sm font-black text-red-500 font-mono">{formatTime(recordingTime)}</span>
                                </div>
                                <button type="button" onClick={() => stopRecording(false)} className="text-slate-400 text-xs font-bold uppercase hover:text-red-500 px-3">Batal</button>
                            </div>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className={`transition-colors ${showEmojiPicker ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <Smile size={20} />
                                </button>
                                <input
                                    type="text"
                                    placeholder="Ketik pesan..."
                                    value={inputText}
                                    onChange={e => setInputText(e.target.value)}
                                    onFocus={() => setShowEmojiPicker(false)}
                                    className="flex-1 bg-transparent text-sm font-bold outline-none text-current"
                                />
                            </>
                        )}
                    </div>

                    {inputText.trim() || isRecording ? (
                        <button
                            type={isRecording ? 'button' : 'submit'}
                            onClick={isRecording ? () => stopRecording(true) : undefined}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 text-white shadow-red-500/30 shadow-lg scale-100' : 'bg-emerald-500 text-white shadow-emerald-500/30 shadow-lg scale-100'}`}
                        >
                            {isRecording ? <Send size={18} /> : <Send size={18} />}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={startRecording}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all bg-slate-200 text-slate-500 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-400 scale-100`}
                        >
                            <Mic size={20} />
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ChatScreen;
