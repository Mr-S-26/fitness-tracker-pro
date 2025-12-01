import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const config: NextConfig = {
  // Your existing config here
};

const makePWA = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  // ✅ FIX: Move skipWaiting inside workboxOptions
  workboxOptions: {
    skipWaiting: true,
  },
});

export default makePWA(config);