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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
