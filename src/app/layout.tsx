import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "LegalDraft AI — Enterprise Legal Document Platform",
    template: "%s | LegalDraft AI",
  },
  description:
    "AI-powered legal document drafting platform for law firms. Draft, manage, analyze, and export legal documents with enterprise-grade tools.",
  keywords: [
    "legal drafting",
    "AI legal assistant",
    "law firm software",
    "document management",
    "legal SaaS",
  ],
  authors: [{ name: "LegalDraft AI Team" }],
  openGraph: {
    type: "website",
    title: "LegalDraft AI",
    description: "Enterprise legal document drafting platform powered by AI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
        <Toaster
          position="bottom-right"
          expand={false}
          richColors
          toastOptions={{
            style: {
              fontFamily: "Inter, sans-serif",
            },
          }}
        />
      </body>
    </html>
  );
}
