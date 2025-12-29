import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: 'Procreate Alpha Studio | Academia de Arte Digital para Niños',
  description: 'Transforma el talento de tus hijos en maestría digital. Lecciones de Procreate aplicadas al dibujo tradicional para niños de 9 a 12 años.',
  keywords: ['arte digital', 'niños', 'procreate', 'dibujo', 'academia', 'educación'],
  authors: [{ name: 'Procreate Alpha Studio' }],
  openGraph: {
    title: 'Procreate Alpha Studio | Academia de Arte Digital',
    description: 'La primera academia de arte digital que enseña el proceso real. ¡Inscribe a tu pequeño artista hoy!',
    url: 'https://procreatealpha.studio',
    siteName: 'Procreate Alpha Studio',
    images: [
      {
        url: '/og-image.jpg', // User should provide this eventually
        width: 1200,
        height: 630,
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block"
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-background-dark text-white min-h-screen flex flex-col`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
