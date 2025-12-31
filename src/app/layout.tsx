import { type Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'AI Chatbot Elite',
  description: 'Experience the next generation of AI conversations',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark" style={{ colorScheme: 'dark' }} suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased chat-gradient min-h-screen bg-[#050505] text-white flex`} suppressHydrationWarning>
          <Sidebar />
          <Header />
          <main className="flex-1 lg:pl-72 pt-4 pb-4 px-6 max-w-6xl mx-auto h-[100dvh] flex flex-col w-full">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  )
}