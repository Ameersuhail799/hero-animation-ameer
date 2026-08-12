import type { Metadata } from "next";
import { Instrument_Sans, Fragment_Mono } from "next/font/google";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  display: "swap",
});

const fragmentMono = Fragment_Mono({
  weight: "400",
  variable: "--font-fragment-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ameer Suhail — AI/ML Engineer & Creative Developer",
  description: "Experimental portfolio hero for Ameer Suhail featuring a liquid field reveal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSans.variable} ${fragmentMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#030304] text-[#F6F2FF] selection:bg-[#7C3AED] selection:text-white">
        {children}
      </body>
    </html>
  );
}
