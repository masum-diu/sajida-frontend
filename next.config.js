/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // output: 'export', // Enable static export
  // trailingSlash: true, // Add trailing slashes for better cPanel compatibility
  // distDir: 'out', // Output directory for static files
  images: {
    // unoptimized: true, // Disables Next.js Image Optimization API (required for static export)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sajedabackend.etherstaging.xyz',
      },
    ],
  },
  // Disable server-side features for static export
  experimental: {
    esmExternals: false,
  },
}

module.exports = nextConfig

