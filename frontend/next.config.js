const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      '@': path.resolve(process.cwd()),
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      '@': path.resolve(process.cwd()),
    },
  },
};

module.exports = nextConfig;