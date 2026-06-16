import "./globals.css";
import "tailwindcss-animate";
import "leaflet/dist/leaflet.css";
import { Metadata } from "next";
import { Providers } from "../components/providers";
import { DM_Sans } from "next/font/google";


const dmSans = DM_Sans({ subsets: ["latin"], weight: ['400', '500', '700'], display: "swap" });

export const metadata: Metadata = {
  title: "Jeho Starter",
  description: "Seamlessly Transitioning to Your New Country with Jehostarter",
};

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.className} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}