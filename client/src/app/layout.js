import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Travel Splitter",
  description:
    "A simple splitter for group trips. Create a trip, add expenses, and see who owes what.",
  viewport: { width: "device-width", initialScale: 1 },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
