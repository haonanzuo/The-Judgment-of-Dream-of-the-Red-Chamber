import type { Metadata } from "next";
import { Noto_Serif_SC } from "next/font/google";

import "./globals.css";

const serif = Noto_Serif_SC({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-serif"
});

export const metadata: Metadata = {
  title: "红楼判词 · 命格推演",
  description: "输入姓名、出生地和出生日期，生成古典判词与白话解签。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={serif.variable}>{children}</body>
    </html>
  );
}
