/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Route handlers need Node runtime for file attachments.
  experimental: {},
};
module.exports = nextConfig;
