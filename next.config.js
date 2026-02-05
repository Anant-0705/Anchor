/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  env: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    OPIK_API_KEY: process.env.OPIK_API_KEY,
  },
};

export default nextConfig;