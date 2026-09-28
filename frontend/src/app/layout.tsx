import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: "GramSeva — Connecting the Land That Connects Us",
  description:
    "Automated integration and intelligent harmonization of multi-source geospatial data for urban land record management.",
  keywords: [
    "GramSeva",
    "land records",
    "geospatial",
    "harmonization",
    "cadastral",
    "GIS",
    "urban planning",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}