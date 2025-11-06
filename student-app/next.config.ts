import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // reactCompiler: true, // Disabled - requires babel-plugin-react-compiler
  turbopack: {
    root: process.cwd()
  }
};

export default nextConfig;
