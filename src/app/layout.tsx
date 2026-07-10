import type { Metadata } from "next";
import { Fraunces, Barlow_Condensed } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["600", "700", "900"],
  style: ["normal", "italic"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Magic Man Vinyl | Discos de vinilo en Guatemala",
  description:
    "Catálogo de vinilos Magic Man Vinyl. Envío gratis e incluye fundas internas y externas en cada disco. Pedidos por depósito.",
};

export const viewport = {
  themeColor: "#1e2a22",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${fraunces.variable} ${barlowCondensed.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-vintage-cream text-deep-grove">
        {children}
      </body>
    </html>
  );
}
