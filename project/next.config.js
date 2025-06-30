// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // required for Netlify or Docker
  experimental: {
    forceDynamic: true, // optional safeguard
  }
};

module.exports = nextConfig;
