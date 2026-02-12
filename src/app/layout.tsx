
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { clsx } from "clsx";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nano Photography - AI Commercial Photo Studio",
  description: "Transform your product photos into professional commercial shots in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={clsx(inter.className, "bg-[#0a0a0a] text-white antialiased")}>
        {children}
      </body>
    </html>
  );
}
