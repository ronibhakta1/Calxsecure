/** @type {import('next').NextConfig} */
const path = require('path');

module.exports = {
  transpilePackages: ["@repo/ui", "@repo/db"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  outputFileTracingRoot: path.join(__dirname, '../../'),
  serverExternalPackages: ['pg', 'pg-native', '@prisma/client'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        pg: false,
        'pg-native': false,
        'pg-connection-string': false,
      };
    }
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push('pg-native');
    }
    return config;
  },
};
