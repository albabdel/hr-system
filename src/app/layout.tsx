import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Inter } from 'next/font/google'

export const metadata: Metadata = {
  title: 'VRS – Verified Recruitment Services',
  description: 'A functional HR SaaS for modern businesses.',
};

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
         {/* Font links are handled by next/font */}
      </head>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
