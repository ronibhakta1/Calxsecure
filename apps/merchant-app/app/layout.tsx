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
}): JSX.Element {
  return (
    <html lang="en">
      <Providers >
        <body className={inter.className  }>
          <QueryProvider>
            {children}
          </QueryProvider>
        </body>
      </Providers>
    </html>
  );
}
