import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable typed routes to fix build issues
  typedRoutes: false,
  
  // Set turbopack root to fix warnings  
  turbopack: {
    root: '.'
  }
};

export default nextConfig;
