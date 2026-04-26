import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
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
  keywords: [
    "meal planning",
    "weight loss",
    "grocery budget",
    "Dubai",
    "meal prep",
    "healthy eating",
  ],
  openGraph: {
    title: "Trym — Eat better. Spend less. Hit your goal.",
    description:
      "Personalised weekly meal plans that fit your weight goal, your budget, and the 20 minutes you actually have to cook.",
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
  themeColor: "#FEF7E6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="bg-cream text-ink antialiased min-h-screen">
        {children}
      </body>
      <GoogleAnalytics gaId="G-R21YJWH25J" />
    </html>
  );
}
