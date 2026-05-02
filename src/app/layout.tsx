import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PwaSetup } from "@/components/PwaSetup";
import "./globals.css";

// Only load the display weight — cuts font payload ~50%
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["800"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const APP_URL = "https://trym.tergomedia.com";

export const metadata: Metadata = {
  title: "Trym — Eat better. Spend less. Hit your goal.",
  description:
    "Personalised weekly meal plans that fit your weight goal, your budget, and the 20 minutes you actually have to cook.",
  applicationName: "Trym App",
  authors: [{ name: "Tergo Media" }],
  manifest: "/manifest.json",

  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon.png", type: "image/png" }],
    shortcut: "/icon.png",
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Trym App",
    startupImage: "/icon.png",
  },

  openGraph: {
    title: "Trym App — Eat better. Spend less. Hit your goal.",
    description:
      "Personalised weekly meal plans for Dubai professionals. Hits your weight goal, your budget, your time.",
    url: APP_URL,
    siteName: "Trym App",
    locale: "en_US",
    type: "website",
    images: [{ url: `${APP_URL}/og-image.png`, width: 1080, height: 1080, alt: "Trym App" }],
  },

  twitter: {
    card: "summary_large_image",
    title: "Trym App — Eat better. Spend less. Hit your goal.",
    description: "Personalised weekly meal plans for Dubai professionals.",
    images: [`${APP_URL}/og-image.png`],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FFF8EE",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="bg-cream text-ink antialiased min-h-screen">
        <PwaSetup />
        {children}
        <SpeedInsights />
      </body>
      {process.env.NODE_ENV === "production" && (
        <GoogleAnalytics gaId="G-R21YJWH25J" />
      )}
    </html>
  );
}
