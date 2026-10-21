/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // 避免 AudioContext 在嚴格模式下雙重觸發初始化問題
};

module.exports = nextConfig;
