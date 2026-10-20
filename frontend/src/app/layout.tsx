import type { Metadata } from "next";
import { Instrument_Sans, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import { AuthProvider } from "@/components/auth/auth-provider";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MÖÖN — Objects in motion.",
  description: "Estudio conceptual de calzado contemporáneo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${instrumentSans.variable} ${geistMono.variable} ${bricolageGrotesque.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
