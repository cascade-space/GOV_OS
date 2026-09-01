import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { LoginProvider } from "@/contexts/LoginContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CivicPath — Civic Issue Management Platform",
  description:
    "Cascade Technologies Solutions — Digital Governance Platform for MLA/Constituency Management. Report civic issues, track resolutions, and build a better community.",
  keywords: "civic issues, governance, MLA, constituency, complaint tracking, digital governance",
  authors: [{ name: "Cascade Technologies Solutions" }],
  openGraph: {
    title: "CivicPath — Digital Governance Platform",
    description: "Report issues, track resolutions, build a better community.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <LoginProvider>
          <LanguageProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#1e3a5f",
                  color: "#fff",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: "500",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                },
                success: {
                  iconTheme: { primary: "#22c55e", secondary: "#fff" },
                },
                error: {
                  iconTheme: { primary: "#ef4444", secondary: "#fff" },
                },
              }}
            />
          </LanguageProvider>
        </LoginProvider>
      </body>
    </html>
  );
}
