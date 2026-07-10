import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite probar el sitio en desarrollo desde el celular usando la IP local
  // de la PC (ajusta o agrega la tuya si cambia, ej. "ipconfig" -> IPv4).
  allowedDevOrigins: ["192.168.0.15"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Las fotos de celular (comprobante y portadas) pueden pesar varios MB;
      // dejamos margen sobre el límite de 5MB que ya validamos en lib/storage.ts.
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
