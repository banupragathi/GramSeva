import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GramSeva — Harmonized Geospatial Land Records",
  description:
    "Harmonize fragmented land records, drone imagery, cadastral maps, and revenue data into one unified, confidence-scored view. SIH26013.",
  keywords: [
    "GramSeva",
    "land records",
    "geospatial",
    "harmonization",
    "cadastral",
    "GIS",
    "SIH26013",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#0A0B0D] text-[#EDEDEA] font-sans selection:bg-[#C41E7D]/30 selection:text-[#EDEDEA]">
        {children}
      </body>
    </html>
  );
}
