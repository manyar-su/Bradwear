
import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Clock, Hash, MessageSquare, Shield, Info, Sparkles, ChevronLeft, Search } from 'lucide-react';
import { ChatMessage } from '../types';
import { syncService } from '../services/syncService';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale/id';

interface ChatScreenProps {
    isDarkMode: boolean;
    onBack?: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ isDarkMode, onBack }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [profileName] = useState(() => localStorage.getItem('profileName') || 'Penjahit Anonymous');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadChat = () => {
            const history = syncService.getChatHistory();
            setMessages(history.map(m => ({
                ...m,
                isMe: m.sender === profileName
            })));
        };

        loadChat();

        // Listen for storage changes to simulate real-time updates across tabs/windows
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'bradwear_global_chat' || !e.key) {
                loadChat();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [profileName]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const newMessage: ChatMessage = {
            id: Math.random().toString(36).substr(2, 9),
            sender: profileName,
            text: inputText.trim(),
            timestamp: new Date().toISOString()
        };

        syncService.sendMessage(newMessage);
        setInputText('');

        // Manual local update since storage event doesn't fire in the same window
        setMessages(prev => [...prev, { ...newMessage, isMe: true }]);
    };

    return (
        <div className={`flex flex-col h-full animate-in fade-in duration-500 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>

            {/* Header */}
            <div className={`p-6 flex justify-between items-center border-b backdrop-blur-md sticky top-0 z-20 ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-100'}`}>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20 text-white">
                        <MessageSquare size={24} />
                    </div>
                    <div>
                        <h2 className={`text-lg font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Forum Penjahit</h2>
                        <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> 10 Staff Aktif
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-32"
            >
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-20 text-center gap-4">
                        <Sparkles size={64} />
                        <p className="text-sm font-black uppercase tracking-widest">Mulai obrolan dengan tim penjahit</p>
                    </div>
                ) : messages.map((msg, i) => (
                    <div
                        key={msg.id}
                        className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}
                        style={{ animationDelay: `${i * 50}ms` }}
                    >
                        {!msg.isMe && (
                            <span className="text-[9px] font-black uppercase text-slate-400 mb-1.5 ml-3 tracking-widest">
                                {msg.sender}
                            </span>
                        )}
                        <div className={`relative max-w-[85%] px-5 py-3.5 rounded-[2rem] shadow-sm text-sm font-bold leading-relaxed ${msg.isMe
                                ? 'bg-emerald-500 text-white rounded-tr-none'
                                : isDarkMode
                                    ? 'bg-slate-800 text-white border border-slate-700 rounded-tl-none'
                                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                            }`}>
                            {msg.text}
                            <div className={`text-[8px] mt-1.5 opacity-60 font-black uppercase text-right ${msg.isMe ? 'text-white' : 'text-slate-400'}`}>
                                {format(new Date(msg.timestamp), 'HH:mm')}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div className={`p-4 pb-8 border-t sticky bottom-0 z-30 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <form onSubmit={handleSendMessage} className="relative flex items-center gap-3">
                    <input
                        type="text"
                        placeholder="Ketik pesan untuk penjahit..."
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        className={`flex-1 h-14 pl-6 pr-14 rounded-2xl text-sm font-bold outline-none border transition-all focus:ring-4 ${isDarkMode
                                ? 'bg-slate-950 border-slate-800 text-white focus:ring-emerald-500/10'
                                : 'bg-slate-50 border-slate-100 text-slate-800 focus:ring-emerald-500/5 shadow-inner'
                            }`}
                    />
                    <button
                        type="submit"
                        className={`absolute right-2 w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 ${inputText.trim() ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-200 text-slate-400'
                            }`}
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatScreen;
