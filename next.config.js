const nextConfig = {
  output: 'standalone', // changed from 'export' to allow dynamic rendering
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    domains: ['images.pexels.com'],
  },
};

module.exports = nextConfig;
