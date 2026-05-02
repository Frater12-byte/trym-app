import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { PwaSetup } from "@/components/PwaSetup";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["700", "800", "900"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Trym — Eat better. Spend less. Hit your goal.",
  description:
    "Personalised weekly meal plans that fit your weight goal, your budget, and the 20 minutes you actually have to cook.",
  applicationName: "Trym",
  authors: [{ name: "Tergo Media" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Trym",
  },
  openGraph: {
    title: "Trym — Eat better. Spend less. Hit your goal.",
    description:
      "Personalised weekly meal plans for Dubai professionals. Hits your weight goal, your budget, your time.",
    url: "https://trym.tergomedia.com",
    siteName: "Trym",
    locale: "en_US",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FFF8EE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="bg-cream text-ink antialiased min-h-screen">
        <PwaSetup />
        {children}
      </body>
      {process.env.NODE_ENV === "production" && (
        <GoogleAnalytics gaId="G-R21YJWH25J" />
      )}
    </html>
  );
}
