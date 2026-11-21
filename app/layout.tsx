import type { Metadata } from "next";
import { Inter } from "next/font/google";
import MobileBottomNav from "@/components/MobileBottomNav";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Bazaar — buy and sell locally",
    template: "%s · Bazaar",
  },
  description:
    "Buy and sell electronics, clothing, home goods, vehicles, pets, rentals and more from local sellers. Browse listings across 16 categories.",
};

// Runs before first paint so a saved dark theme never flashes light.
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem("bazaar-theme");
    var dark = stored === "dark" || (stored === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  } catch (error) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans">
        {children}
        <MobileBottomNav />
      </body>
    </html>
  );
}
