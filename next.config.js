/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true
  },
  output: 'standalone',
  // 移除所有实验性功能
  experimental: {}
}

module.exports = nextConfig 