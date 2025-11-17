/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Configuration pour GitHub Pages
  basePath: '/AgentIA_Commercial',
  env: {
    NEXT_PUBLIC_APP_NAME: 'Agent Commercial IA',
    NEXT_PUBLIC_APP_VERSION: '2.0.0',
  },
}

module.exports = nextConfig
