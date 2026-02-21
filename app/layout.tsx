import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "상명대학교 수강신청 시뮬레이터 | SMU Sugang Trainer - OriginKim",
  description: "상명대 sugang.smu.ac.kr 실제 타이밍 연습. 5~30초 전 시뮬레이션. 수강신청 꿀팁 공개!",
  keywords: "상명대, 수강신청, smu, sugang, 시뮬레이터, trainer, 상명대학교",
  openGraph: {
    title: "상명대 수강신청 시뮬레이터",
    description: "상명대 수강신청 연습용 트레이너",
    url: "https://smu-sugang-trainer.vercel.app",
    type: "website",
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
      <meta
        name="google-site-verification"
        content="GCUW21Ft4gN01ccnn3OA1vNMP9NpCipppskqUJxHz5M"
      />
    </head>

    <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      {children}
      <Analytics />
    </body>
  </html>
);

}

