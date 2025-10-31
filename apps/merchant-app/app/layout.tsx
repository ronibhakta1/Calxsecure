import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "../provider";
import QueryProvider from "../components/QueryProvider"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CalxSecure",
  description: "payment app",
  keywords: ["payments", "security", "fintech"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* ---- Session / Auth Provider (client) ---- */}
      <Providers>
        <body className={inter.className}>
          {/* ---- React-Query Provider (client) ---- */}
          <QueryProvider>{children}</QueryProvider>
        </body>
      </Providers>
    </html>
  );
}