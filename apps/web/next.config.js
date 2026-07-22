/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@builderos/db", "@builderos/plugin-sdk", "@builderos/plugin-github"],
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
};

export default nextConfig;
