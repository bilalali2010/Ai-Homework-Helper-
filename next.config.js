/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 🚀 Prevent heavy OCR / AI libs from breaking build
  experimental: {
    serverComponentsExternalPackages: ["tesseract.js"]
  },

  // 🚀 Improve stability on Vercel serverless
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push("tesseract.js");
    }

    return config;
  },

  // 🚀 Optimize output for Vercel
  output: "standalone"
};

module.exports = nextConfig;
