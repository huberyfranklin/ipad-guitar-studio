import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'iPad Guitar Studio - 互動式吉他學院',
  description: '專為 iPad 設計的無影片互動式吉他指板與節奏訓練工作台',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Guitar Studio',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

// iPad 專屬 Viewport 配置：鎖定比例、防止雙指與雙擊縮放
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW" className="dark">
      <body className="antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
