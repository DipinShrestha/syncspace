// frontend/next.config.js
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Webpack alias for compatibility (Render/Vercel builds)
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      '@': path.resolve(process.cwd()),
    };
    return config;
  },
  // Turbopack alias for local development (npm run dev)
  turbopack: {
    resolveAlias: {
      '@': path.resolve(process.cwd()),
    },
  },
};

module.exports = nextConfig;