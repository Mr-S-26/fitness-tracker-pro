import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers"; // ✅ Import this

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fitness Tracker Pro",
  description: "AI-Powered Workout Tracking",
  manifest: "/manifest.json", // ✅ Link to the manifest
  themeColor: "#7c3aed",      // ✅ Matches your brand purple
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,          // Prevents zooming on inputs (app-like feel)
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // ✅ ADD: suppressHydrationWarning is critical for next-themes
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* ✅ ADD: Wrap everything in Providers */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}