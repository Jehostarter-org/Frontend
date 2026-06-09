import "./globals.css";
import "tailwindcss-animate";
import { Metadata } from "next";
import { Providers } from "../components/providers";
import { IBM_Plex_Sans, DM_Sans, Roboto } from "next/font/google";



const dmSans = DM_Sans({ subsets: ["latin"], weight: ['400', '500', '700'], display: "swap" });
const ibmPlex = IBM_Plex_Sans({ subsets: ["latin"], weight: ['400', '500', '600', '700'], display: "swap" });
const roboto = Roboto({ subsets: ["latin"], weight: ['400', '500', '700'], display: "swap" });

export const metadata: Metadata = {
  title: "Jeho Starter",
  description: "Seamlessly Transitioning to Your New Country with Jehostarter",
};

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${ibmPlex.className} ${dmSans.className} ${roboto.className} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}