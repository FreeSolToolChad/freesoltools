import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { WalletContextProvider } from "@/components/WalletContextProvider";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import Script from "next/script";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const metadataBase = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
);
const isProduction = process.env.NODE_ENV === "production";

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "FreeSolTools | The Only 0% Fee Solana Wallet Cleaner.",
    template: "%s"
  },
  description: "The Only 0% Fee Solana Wallet Cleaner.",
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    images: ['/images/social-preview.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/images/social-preview.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {isProduction && (
          <Script 
            id="crisp-widget"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `window.$crisp=[];window.CRISP_WEBSITE_ID="1aebd79c-905b-4b75-94a9-ecb1c57634a7";(function(){d=document;s=d.createElement("script");s.src="https://client.crisp.chat/l.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();`
            }}
          />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0a] text-zinc-100 flex min-h-screen selection:bg-[#e2fbff]/30`}
      >
        <WalletContextProvider>
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Navbar />
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </div>
        </WalletContextProvider>
      </body>
    </html>
  );
}
