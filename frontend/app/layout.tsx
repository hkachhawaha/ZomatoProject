import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/styles";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zomato AI — Restaurant Recommendations",
  description:
    "Discover your perfect restaurant with AI-powered personalized recommendations. Curated for your mood, budget, and taste preferences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        {children}
      </body>
    </html>
  );
}
