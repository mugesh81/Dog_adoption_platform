/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Local development
      { protocol: 'http',  hostname: 'localhost' },
      // Common cloud hosting providers — add your specific backend domain here
      { protocol: 'https', hostname: '*.railway.app' },
      { protocol: 'https', hostname: '*.render.com' },
      { protocol: 'https', hostname: '*.onrender.com' },
      { protocol: 'https', hostname: '*.up.railway.app' },
      // Cloudinary (if you migrate image storage there)
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
    // If deploying backend on a custom domain, also set this env var:
    // NEXT_PUBLIC_IMAGE_DOMAIN=your-backend-domain.com
    ...(process.env.NEXT_PUBLIC_IMAGE_DOMAIN
      ? {
          remotePatterns: [
            { protocol: 'https', hostname: process.env.NEXT_PUBLIC_IMAGE_DOMAIN },
          ],
        }
      : {}),
  },
  turbopack: {
    root: __dirname,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  },
};

module.exports = nextConfig;
