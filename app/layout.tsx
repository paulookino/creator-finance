import type { Metadata } from "next";
import { Poppins, DM_Mono } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: 'CreatorFinance',
    template: '%s · CreatorFinance',
  },
  description: 'Dashboard financeiro para criadores de conteúdo. Kiwify, Hotmart e AdSense num só lugar.',
  keywords: ['criadores de conteúdo', 'dashboard financeiro', 'kiwify', 'hotmart', 'receita', 'imposto'],
  authors: [{ name: 'CreatorFinance' }],
  creator: 'CreatorFinance',
  metadataBase: new URL('https://creator-finance-pi.vercel.app'),
  openGraph: {
    title: 'CreatorFinance',
    description: 'Toda sua receita de criador. Um lugar só.',
    url: 'https://creator-finance-pi.vercel.app',
    siteName: 'CreatorFinance',
    locale: 'pt_BR',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-icon.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${poppins.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
