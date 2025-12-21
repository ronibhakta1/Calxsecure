/** @type {import('next').NextConfig} */
const path = require('path');

module.exports = {
  transpilePackages: ["@repo/ui"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  outputFileTracingRoot: path.join(__dirname, '../../'),
};
