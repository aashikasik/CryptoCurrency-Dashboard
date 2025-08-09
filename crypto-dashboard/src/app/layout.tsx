import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from 'next/link';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Crypto Dashboard",
  description: "A dashboard for tracking cryptocurrency prices and trends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
          <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            <nav className="w-full flex justify-end gap-6 px-6 py-4 border-b bg-white shadow-sm mb-6">
              <Link href="/" className="font-bold text-lg text-green-600">Markets</Link>
              <Link href="/watchlist" className="font-bold text-lg text-yellow-500">Watchlist</Link>
            </nav>
            <main>{children}</main>
      </body>
    </html>
  );
}
