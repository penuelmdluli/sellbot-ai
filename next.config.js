/** @type {import('next').NextConfig} */
module.exports = {
  // Cloudflare Pages compatible settings
  output: "standalone",
  images: {
    unoptimized: true,
  },
}
