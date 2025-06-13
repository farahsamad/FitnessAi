import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import HeaderComponent from "@/components/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FitnessAi",
  description:
    "AI-powered platform creates customized workout and diet plans tailored to individual goals, fitness level, and lifestyle.",
  manifest: "/site.webmanifest",
  icons: {
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "FitnessAi",
    description:
      "AI-powered platform creates customized workout and diet plans tailored to individual goals, fitness level, and lifestyle.",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "FitnessAi",
    images: "/images/open-graph.png",
    // [
    //   {
    //     url: "https://nextjs.org/og.png", // Must be an absolute URL
    //     width: 800,
    //     height: 600,
    //   },
    //   {
    //     url: "https://nextjs.org/og-alt.png", // Must be an absolute URL
    //     width: 1800,
    //     height: 1600,
    //     alt: "My custom alt",
    //   },
    // ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <HeaderComponent />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
