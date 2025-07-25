//src/app/layout.tsx
import type { Metadata } from "next";
import { Geist } from "next/font/google"; // Using Geist Sans only for simplicity
import "./globals.css";

import Header from "@/components/layouts/header/Header";
import Footer from "@/components/layouts/footer/Footer";
import Sidebar from "@/components/layouts/sidebar/Sidebar";
import ReduxProvider from "@/components/layouts/ReduxProvider";
import SessionProviderWrapper from "@/components/layouts/SessionProviderWrapper";
import { ThemeProvider } from "@/components/layouts/ThemeProvider";
import { NextAuthSync } from "@/components/layouts/NextAuthSync";
import DevLoginPanel from "@/components/dev/DevLoginPanel";
import { Toaster } from "sonner"; // <-- 1. IMPORT SONNER

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EduPlatform",
  description: "Your modern learning management system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <ReduxProvider>
          <SessionProviderWrapper>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem={false}
              disableTransitionOnChange
            >
              <NextAuthSync />
              <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
                <Sidebar />
                <div className="flex flex-col">
                  <Header />
                  <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                    {children}
                  </main>
                  <Footer />
                </div>
              </div>
              <DevLoginPanel />
              <Toaster richColors position="top-right" />{" "}
            </ThemeProvider>
          </SessionProviderWrapper>
        </ReduxProvider>
      </body>
    </html>
  );
}
