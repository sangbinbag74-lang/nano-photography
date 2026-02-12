
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { clsx } from "clsx";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nano Photography - AI Commercial Photo Studio",
  description: "Transform your product photos into professional commercial shots in seconds.",
};


import { LanguageProvider } from "@/lib/i18n";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={clsx(inter.className, "bg-black text-white antialiased selection:bg-blue-500 selection:text-white")}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}


