'use client';

import { useState, useEffect } from 'react';
import { Plus, MessageSquare, Menu, X, Settings } from 'lucide-react';
import { useUser, SignedIn, UserButton } from '@clerk/nextjs';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Chat {
    id: string;
    title: string;
    updatedAt: string;
}

export default function Sidebar() {
    const { isLoaded: userLoaded, isSignedIn } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [chats, setChats] = useState<Chat[]>([]);
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
        if (!userLoaded || !isSignedIn) {
            setIsFetching(false);
            return;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const fetchChats = async () => {
            console.log("LOG: Sidebar - Fetching chats...");
            setIsFetching(true);
            try {
                const headers: HeadersInit = {};
                if (userLoaded && isSignedIn && (window as any).Clerk?.user?.id) {
                    headers['X-Clerk-User-Id'] = (window as any).Clerk.user.id;
                }

                const response = await fetch('/api/chats', {
                    signal: controller.signal,
                    headers: headers
                });
                console.log("LOG: Sidebar - Fetch response status:", response.status);
                if (response.ok) {
                    const data = await response.json();
                    setChats(data);
                }
            } catch (error: any) {
                if (error.name === 'AbortError') {
                    console.log("LOG: Sidebar - Request aborted (sign-out or unmount)");
                } else {
                    console.error("LOG: Sidebar - Failed to fetch chats:", error);
                }
            } finally {
                setIsFetching(false);
                clearTimeout(timeoutId);
            }
        };

        fetchChats();
        return () => {
            controller.abort();
            clearTimeout(timeoutId);
        };
    }, [userLoaded, isSignedIn]);

    const toggleSidebar = () => setIsOpen(!isOpen);

    const startNewChat = () => {
        window.location.href = '/';
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-white shadow-lg rounded-xl border border-gray-200 text-slate-700"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Backdrop for Mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed top-0 left-0 bottom-0 z-50 w-72 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-xl",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Header: Logo & New Chat */}
                <div className="p-4 space-y-4">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-sm">A</span>
                        </div>
                        <span className="font-bold text-lg text-slate-800">
                            Elite AI
                        </span>
                    </div>

                    <button
                        onClick={startNewChat}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl transition-all group text-sm font-medium text-slate-700"
                    >
                        <Plus className="w-5 h-5 text-gray-500 group-hover:text-violet-600 group-active:scale-90 transition-all" />
                        <span>New Chat</span>
                    </button>
                </div>

                {/* Body: Chat History */}
                <div className="flex-1 overflow-y-auto px-2 space-y-1 py-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300">
                    <div className="px-4 mb-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recent Chats</span>
                    </div>
                    {isFetching ? (
                        <div className="px-4 py-2 text-sm text-gray-500 flex items-center gap-2">
                            <div className="w-3 h-3 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin"></div>
                            <span>Syncing...</span>
                        </div>
                    ) : chats.length === 0 ? (
                        <div className="px-4 py-2 text-sm text-gray-400">No chats yet</div>
                    ) : (
                        chats.map((chat) => (
                            <button
                                key={chat.id}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl transition-all group text-left"
                                onClick={() => window.location.href = `/?chatId=${chat.id}`}
                            >
                                <MessageSquare className="w-4 h-4 text-gray-400 group-hover:text-violet-600 transition-colors" />
                                <span className="text-sm text-slate-600 truncate group-hover:text-slate-900">
                                    {chat.title}
                                </span>
                            </button>
                        ))
                    )}
                </div>

                {/* Footer: Auth & Profile */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <SignedIn>
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <UserButton
                                    appearance={{
                                        elements: {
                                            userButtonAvatarBox: 'w-9 h-9 border border-gray-200'
                                        }
                                    }}
                                />
                                <span className="text-sm font-medium text-slate-700">Account</span>
                            </div>
                            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-slate-700 transition-all">
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </SignedIn>
                </div>
            </aside>
        </>
    );
}
