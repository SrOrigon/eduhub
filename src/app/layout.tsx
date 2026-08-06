import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EduHub — Gestão Escolar + Gamificação",
  description: "Plataforma educacional gratuita unindo gestão acadêmica e gamificação para escolas e cursos.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} light h-full bg-white antialiased`}
    >
      <body className="flex min-h-dvh flex-col bg-white text-slate-900">{children}</body>
    </html>
  );
}
