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

function ThemeLoader() {
  // client-only loader sets CSS vars after fetch
  return <script dangerouslySetInnerHTML={{__html:`
    (async function(){
      try{
        const r = await fetch('/api/tenant/status',{credentials:'include'});
        if(!r.ok) return;
        const s = await r.json();
        if(s?.theme?.primary){
          document.documentElement.style.setProperty('--brand', s.theme.primary);
        }
        if(s?.theme?.logoUrl){
          document.documentElement.style.setProperty('--logo-url', 'url('+s.theme.logoUrl+')');
        }
      }catch(e){}
    })();
  `}} />;
}

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
        <ThemeLoader />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
