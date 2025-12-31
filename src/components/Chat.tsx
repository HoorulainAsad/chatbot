'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    parts?: any[];
};

export default function Chat() {
    const searchParams = useSearchParams();
    const urlChatId = searchParams.get('chatId');

    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [localInput, setLocalInput] = useState('');
    const [chatId, setChatId] = useState<string>('');

    const scrollRef = useRef<HTMLDivElement>(null);

    const { isLoaded: userLoaded } = useUser();

    useEffect(() => {
        if (!userLoaded) return;

        console.log("LOG: Chat - urlChatId changed:", urlChatId);
        if (urlChatId) {
            setChatId(urlChatId);
            fetchMessages(urlChatId);
        } else {
            console.log("LOG: Chat - No chatId in URL, generating new session ID");
            const newChatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            setChatId(newChatId);
            setMessages([]);
        }
    }, [urlChatId, userLoaded]);

    const fetchMessages = async (id: string) => {
        console.log("LOG: Chat - Fetching messages for:", id);
        setIsLoading(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        try {
            const response = await fetch(`/api/chat/${id}`, { signal: controller.signal });
            console.log("LOG: Chat - Fetch response status:", response.status);
            if (response.ok) {
                const data = await response.json();
                setMessages(data.messages || []);
            } else if (response.status === 401) {
                console.log("LOG: Chat - Unauthorized message fetch");
                setMessages([]);
            }
        } catch (err: any) {
            if (err.name === 'AbortError') {
                console.log("LOG: Chat - Request aborted");
            } else {
                console.error("LOG: Chat - Failed to fetch messages:", err);
            }
        } finally {
            setIsLoading(false);
            clearTimeout(timeoutId);
        }
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, error]);

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!localInput.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: localInput
        };

        setMessages(prev => [...prev, userMsg]);
        setLocalInput('');
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMsg],
                    chatId: chatId
                })
            });

            if (!response.ok) {
                let errorTitle = `Server Error (${response.status})`;
                let errorDetail = "";
                try {
                    const errorData = await response.json();
                    errorDetail = errorData.details || errorData.error || "No specific details provided.";
                } catch (e) {
                    errorDetail = "The server returned an invalid response.";
                }
                throw new Error(`${errorTitle}: ${errorDetail}`);
            }

            const data = await response.json();
            const assistantMsgId = (Date.now() + 1).toString();

            setMessages(prev => [...prev, {
                id: assistantMsgId,
                role: 'assistant',
                content: data.text
            }]);

        } catch (err: any) {
            console.error("Chat submission error:", err);
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-3xl relative border border-gray-200 shadow-xl">
            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300"
            >
                {!messages || messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-80">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-violet-100 to-blue-100 flex items-center justify-center border border-violet-200 shadow-xl"
                        >
                            <Bot className="w-10 h-10 text-violet-600" />
                        </motion.div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold tracking-tight text-slate-800">Chatbot Elite</h2>
                            <p className="max-w-xs text-sm text-gray-500">Your premium AI assistant is ready. How can I assist you today?</p>
                        </div>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {messages.map((m) => (
                            <motion.div
                                key={m.id}
                                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={cn(
                                    "flex gap-4 max-w-[85%]",
                                    m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                                )}
                            >
                                <div className={cn(
                                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg transition-transform hover:scale-105",
                                    m.role === 'user' ? "bg-gradient-to-br from-violet-600 to-blue-600 text-white" : "bg-gray-100 border border-gray-200"
                                )}>
                                    {m.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5 text-violet-600" />}
                                </div>
                                <div className={cn(
                                    "px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed whitespace-pre-wrap shadow-md",
                                    m.role === 'user'
                                        ? "bg-gradient-to-br from-violet-600 to-blue-600 text-white font-medium"
                                        : "bg-gray-50 border border-gray-200 text-slate-700"
                                )}>
                                    {m.content}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
                {isLoading && (
                    <div className="flex gap-4 max-w-[85%] mr-auto">
                        <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200 shadow-lg">
                            <Bot className="w-5 h-5 text-violet-600" />
                        </div>
                        <div className="px-5 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 flex items-center gap-3 shadow-md">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"></span>
                            </div>
                            <span className="text-xs text-gray-500 font-bold uppercase tracking-widest italic pt-0.5">Elite Intelligence</span>
                        </div>
                    </div>
                )}
                {error && (
                    <div className="flex gap-4 max-w-[85%] mr-auto">
                        <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center border border-red-200 shadow-lg">
                            <Bot className="w-5 h-5 text-red-500" />
                        </div>
                        <div className="px-5 py-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 shadow-md">
                            <div className="font-semibold mb-1 text-red-500 text-xs uppercase tracking-wider">System Error</div>
                            {error.message || "An unexpected error occurred. Please try again."}
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-5 bg-gray-50 border-t border-gray-200 relative z-10">
                <form
                    onSubmit={onSubmit}
                    className="relative flex items-center gap-2 max-w-4xl mx-auto"
                >
                    <input
                        className="flex-1 bg-white border border-gray-200 rounded-2xl px-6 py-4 pr-14 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition-all placeholder:text-gray-400 text-sm text-slate-700 shadow-sm"
                        value={localInput}
                        placeholder="Deep thinking enabled. Message Elite..."
                        onChange={(e) => setLocalInput(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !localInput?.trim()}
                        className="absolute right-2 p-2.5 bg-gradient-to-br from-violet-600 to-blue-600 text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 shadow-lg"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
                <div className="flex items-center justify-center gap-4 mt-4 opacity-40 select-none">
                    <div className="h-[1px] w-12 bg-gray-300"></div>
                    <p className="text-[9px] uppercase tracking-[0.3em] font-black text-gray-400 italic">
                        Gemini 1.5 Flash • v2.0.0
                    </p>
                    <div className="h-[1px] w-12 bg-gray-300"></div>
                </div>
            </div>
        </div>
    );
}
