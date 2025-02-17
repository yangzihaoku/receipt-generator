/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 添加图片域名白名单
  images: {
    domains: ['localhost'],
    unoptimized: true
  },
  // 输出独立构建
  output: 'standalone',
  // 生产环境 source maps
  productionBrowserSourceMaps: true,
  // 实验性功能
  experimental: {
    // 移除了不支持的 buildTimeout
    optimizeCss: true,
    scrollRestoration: true
  }
}

module.exports = nextConfig 