/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  experimental: {
    serverComponentsExternalPackages: [
      "tesseract.js",
      "sharp"
    ]
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push("tesseract.js");
      config.externals.push("sharp");
    }

    return config;
  },

  output: "standalone"
};

module.exports = nextConfig;
