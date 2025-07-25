import type { Metadata } from "next";
import { Noto_Sans_JP, Noto_Sans } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "../components/LanguageProvider";
import { Toaster } from "react-hot-toast";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
});

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
});

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "百合日記 | Yuri Journal",
  description: "百合日記 | Yuri Journal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${notoSansJP.variable} ${notoSans.variable} antialiased`}
      >
        <Toaster />
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
