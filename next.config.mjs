/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // ── Local development ─────────────────────────────────────────────────
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/**",
      },
      // ── Production backend (Render) ───────────────────────────────────────
      {
        protocol: "https",
        hostname: "jehostarter-backend.onrender.com",
        pathname: "/**",
      },
      // ── Avatar / placeholder services ─────────────────────────────────────
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        pathname: "/**",
      },
      // ── Wildcard: any HTTPS host (covers future third-party image URLs) ───
      // Add specific hostnames here instead of using wildcard
      // {
      //   protocol: "https",
      //   hostname: "**",
      //   pathname: "/**",
      // },
    ],
  },
};

export default nextConfig;
