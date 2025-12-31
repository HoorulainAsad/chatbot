'use client';

import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { LogIn } from 'lucide-react';

export default function Header() {
    return (
        <header className="fixed top-0 right-0 z-50 p-4 lg:pr-8">
            <div className="flex items-center gap-3">
                <SignedIn>
                    <UserButton
                        appearance={{
                            elements: {
                                userButtonAvatarBox: 'w-10 h-10 border-2 border-gray-200 shadow-lg'
                            }
                        }}
                    />
                </SignedIn>
                <SignedOut>
                    <SignInButton mode="modal">
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold text-sm rounded-xl hover:opacity-90 transition-all shadow-lg shadow-violet-300/50 active:scale-95">
                            <LogIn className="w-4 h-4" />
                            Sign In
                        </button>
                    </SignInButton>
                </SignedOut>
            </div>
        </header>
    );
}
