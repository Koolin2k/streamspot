/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // ✅ Only supported keys go here if needed
    serverActions: true,
  },
};

module.exports = nextConfig;

