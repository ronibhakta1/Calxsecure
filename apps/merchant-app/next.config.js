/** @type {import('next').NextConfig} */
const path = require('path');

module.exports = {
  transpilePackages: ["@repo/ui", "@repo/db"],
  staticPageGenerationTimeout: 120,
  swcMinify: true,
  output: "standalone",
  typescript: {
    tsconfigPath: "./tsconfig.json"
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
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
