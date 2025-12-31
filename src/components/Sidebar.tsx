'use client';

import { useState, useEffect } from 'react';
import { Plus, MessageSquare, Menu, X, Bot, LogOut, Settings } from 'lucide-react';
import { useUser, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
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
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

        // Fetch chats from API
        const fetchChats = async () => {
            console.log("LOG: Sidebar - Fetching chats...");
            setIsFetching(true);
            try {
                const headers: HeadersInit = {};
                // Manually pass user ID since middleware is disabled
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
                // AbortError is expected during sign-out or component unmount - ignore silently
                if (error.name === 'AbortError') {
                    // Only log if not during cleanup
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
        // Logic to clear current chat and start a new one
        window.location.href = '/';
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 text-white"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Backdrop for Mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed top-0 left-0 bottom-0 z-50 w-72 bg-[#0a0a0a] border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Header: Logo & New Chat */}
                <div className="p-4 space-y-4">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/10">
                            <span className="text-white font-bold text-sm">A</span>
                        </div>
                        <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Elite AI
                        </span>
                    </div>

                    <button
                        onClick={startNewChat}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group text-sm font-medium"
                    >
                        <Plus className="w-5 h-5 text-gray-400 group-hover:text-white group-active:scale-90 transition-all" />
                        <span>New Chat</span>
                    </button>
                </div>

                {/* Body: Chat History */}
                <div className="flex-1 overflow-y-auto px-2 space-y-1 py-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
                    <div className="px-4 mb-2">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Recent Chats</span>
                    </div>
                    {isFetching ? (
                        <div className="px-4 py-2 text-sm text-gray-500 flex items-center gap-2">
                            <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                            <span>Syncing...</span>
                        </div>
                    ) : chats.length === 0 ? (
                        <div className="px-4 py-2 text-sm text-gray-500">No chats yet</div>
                    ) : (
                        chats.map((chat) => (
                            <button
                                key={chat.id}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-all group text-left"
                                onClick={() => window.location.href = `/?chatId=${chat.id}`}
                            >
                                <MessageSquare className="w-4 h-4 text-gray-500 group-hover:text-primary transition-colors" />
                                <span className="text-sm text-gray-300 truncate group-hover:text-white">
                                    {chat.title}
                                </span>
                            </button>
                        ))
                    )}
                </div>

                {/* Footer: Auth & Profile */}
                <div className="p-4 border-t border-white/10 bg-[#0a0a0a]">
                    <SignedIn>
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <UserButton
                                    appearance={{
                                        elements: {
                                            userButtonAvatarBox: 'w-9 h-9 border border-white/10'
                                        }
                                    }}
                                />
                                <span className="text-sm font-medium text-gray-300">Account</span>
                            </div>
                            <button className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-all">
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </SignedIn>
                </div>
            </aside>
        </>
    );
}

