
import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Clock, Hash, MessageSquare, Shield, Info, Sparkles, ChevronLeft, Search, Camera, Image as ImageIcon, History, X, Check, Package, AlertTriangle, PlusCircle, Users, Wifi, WifiOff } from 'lucide-react';
import { ChatMessage, OrderItem, JobStatus } from '../types';
import { syncService } from '../services/syncService';
import { supabaseService, ChatMessageDB, OnlineUserDB } from '../services/supabaseService';
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
        chatChannelRef.current = supabaseService.subscribeToChatMessages((newMsg) => {
            setMessages(prev => [...prev, {
                id: newMsg.id || '',
                sender: newMsg.sender,
                text: newMsg.text || '',
                image: newMsg.image,
                timestamp: newMsg.created_at || new Date().toISOString(),
                isMe: newMsg.sender === currentName
            }]);
        });

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
        } catch (e) {
            console.error('Failed to send message:', e);
        } finally {
            setIsSending(false);
        }
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

        let summary = `📍 *SHARE HISTORI KERJA*\n`;
        summary += `Kode: *${selectedHistoryOrder.kodeBarang}*\n`;
        summary += `Model: ${selectedHistoryOrder.model} (${selectedHistoryOrder.modelDetail || 'Standar'})\n`;
        summary += `Status: ${selectedHistoryOrder.status}\n`;
        summary += `Total: ${selectedHistoryOrder.jumlahPesanan} PCS\n`;
        summary += `----------- RINCIAN -----------\n`;
        summary += selectedHistoryOrder.sizeDetails.map(sd =>
            `• ${sd.size} [${sd.gender}] (${sd.tangan}) : ${sd.jumlah} PCS`
        ).join('\n');

        handleSendMessage(summary);
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
                        <h2 className={`text-lg font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Forum Penjahit</h2>
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
                        <div className={`relative max-w-[85%] ${msg.image ? 'p-1.5' : 'px-5 py-3.5'} rounded-[2rem] border shadow-sm text-sm font-bold leading-relaxed ${msg.isMe
                            ? 'bg-emerald-500 text-white rounded-tr-none border-emerald-400/20'
                            : isDarkMode
                                ? 'bg-slate-800 text-white border-slate-700 rounded-tl-none'
                                : 'bg-white text-slate-800 border-slate-100 rounded-tl-none'}`}>
                            {msg.image && (
                                <img src={msg.image} alt="Shared" className="w-full h-auto rounded-[1.5rem] mb-2 max-h-64 object-cover" />
                            )}
                            {msg.text && (
                                <div className={msg.image ? 'px-3 pb-2 break-words' : 'break-words'}>
                                    {msg.text.split('\n').map((line, idx) => (
                                        <div key={idx} className={line.startsWith('📍') || line.startsWith('*') ? 'text-[10px] italic font-bold opacity-90' : ''}>{line}</div>
                                    ))}
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

            {/* History Popup */}
            {showHistoryPopup && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className={`relative w-full max-w-sm rounded-[3rem] p-8 shadow-2xl flex flex-col max-h-[80vh] ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black">Pilih Histori</h3>
                            <button onClick={() => setShowHistoryPopup(false)} className="text-slate-400 hover:text-red-500"><X size={24} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-3">
                            {historyOrders.map(o => (
                                <button key={o.id} onClick={() => setSelectedHistoryOrder(o)} className={`w-full p-4 rounded-3xl border text-left flex justify-between items-center transition-all ${selectedHistoryOrder?.id === o.id ? 'border-emerald-500 bg-emerald-500/10' : isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                                    <div>
                                        <p className="text-[10px] font-black text-emerald-500 mb-1">{o.kodeBarang}</p>
                                        <p className="text-xs font-bold">{o.model}</p>
                                    </div>
                                    {selectedHistoryOrder?.id === o.id && <Check size={18} className="text-emerald-500" />}
                                </button>
                            ))}
                        </div>
                        <button onClick={handleShareHistory} disabled={!selectedHistoryOrder} className="w-full py-4 mt-6 bg-emerald-500 text-white rounded-2xl font-black uppercase text-xs disabled:opacity-50">Bagikan ke Forum</button>
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
                        <div className="p-3 bg-purple-500 rounded-2xl text-white shadow-md"><History size={20} /></div>
                        <span className="text-[9px] font-black uppercase">Histori</span>
                    </button>
                </div>
            )}

            {/* Input Area */}
            <div className={`p-4 pb-12 border-t sticky bottom-0 z-30 transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]'}`}>
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="relative flex items-center gap-3">
                    <button type="button" onClick={() => setShowShareOptions(!showShareOptions)} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${showShareOptions ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500'}`}>
                        {showShareOptions ? <X size={20} /> : <PlusCircle size={24} />}
                    </button>
                    <input
                        type="text"
                        placeholder="Ketik pesan..."
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        className={`flex-1 h-12 pl-6 pr-12 rounded-2xl text-sm font-bold outline-none border transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-100 text-slate-800 shadow-inner'}`}
                    />
                    <button type="submit" className={`absolute right-2 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${inputText.trim() ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-300'}`}>
                        <Send size={16} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatScreen;
