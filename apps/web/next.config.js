/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@builderos/db", "@builderos/plugin-sdk", "@builderos/plugin-github"],
};

export default nextConfig;
