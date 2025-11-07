
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "../provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CalxSecure",
  description: "payment app",
  keywords: ["payments", "security", "fintech"],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <Providers>
        <body className={inter.className}>
          <div className=" selection:bg-zinc-300 selection:text-zinc-950 min-w-screen min-h-screen bg-[#ebe6e6]">
            {children}
          </div>
        </body>
      </Providers>
    </html>
  );
}
