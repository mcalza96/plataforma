import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.jitdata.cl'),
  title: 'JIT Data Analytics | Inteligencia Artificial y Análisis de Datos Educativos',
  description: 'Optimizando el aprendizaje a través del análisis de datos en tiempo real. Plataforma avanzada de telemetría y diagnóstico cognitivo.',
  keywords: ['data analytics', 'educación', 'IA', 'telemetría', 'JIT Data', 'diagnóstico cognitivo', 'análisis de datos'],
  authors: [{ name: 'JIT Data Team' }],
  openGraph: {
    title: 'JIT Data Analytics | Inteligencia Educativa',
    description: 'Transformamos datos en decisiones pedagógicas accionables.',
    url: 'https://www.jitdata.cl',
    siteName: 'JIT Data Analytics',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'JIT Data Analytics - Inteligencia Educativa'
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JIT Data Analytics | Data Driven Education',
    description: 'La próxima generación de analítica de aprendizaje.',
    images: ['/og-image.jpg'],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { ToastProvider } from "@/context/ToastContext";

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
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
