/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      uuid: require.resolve('uuid'),
    };
    return config;
  },
};

module.exports = nextConfig; 