// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Bali Wedding AI Assistant - Plan Your Dream Wedding',
  description: 'AI-powered wedding planning assistant for your perfect Bali wedding',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light scroll-smooth">
      <body className={`${inter.className} min-h-screen bg-white dark:bg-gray-900 transition-colors overflow-x-hidden`}>
        {children}
      </body>
    </html>
  );
}