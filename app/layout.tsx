import "./globals.css";
import "tailwindcss-animate";
import "leaflet/dist/leaflet.css";
import { Metadata } from "next";
import { Providers } from "../components/providers";
import { DM_Sans } from "next/font/google";


const dmSans = DM_Sans({ subsets: ["latin"], weight: ['400', '500', '700'], display: "swap" });

export const metadata: Metadata = {
  title: "Jehostarter - Your Migration Companion",
  description:
    "Settle into your new country with confidence. Jehostarter connects you with shops, services, communities, and everything you need to make your transition smooth.",
  keywords: [
    "migration",
    "relocation",
    "new country",
    "settlement",
    "expat services",
    "community",
    "marketplace",
  ],
  authors: [{ name: "Jehostarter" }],
  openGraph: {
    title: "Jehostarter - Your Migration Companion",
    description:
      "Settle into your new country with confidence. Shops, services, and community — all in one place.",
    url: "https://jehostarter.com",
    siteName: "Jehostarter",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jehostarter - Your Migration Companion",
    description:
      "Settle into your new country with confidence.",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  themeColor: "#ffffff",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/images/small logo WHITE.png" />
      </head>
      <body className={`${dmSans.className} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}