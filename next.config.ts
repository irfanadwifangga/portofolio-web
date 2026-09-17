import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Enables app/global-not-found.tsx, the 404 page for every unmatched URL.
    // With two root layouts (app/(en), app/id) there is no single layout to
    // render a not-found.tsx inside, and a catch-all route calling notFound()
    // answered with Next's error shell: no lang, no theme script, wrong title.
    globalNotFound: true
  }
};

export default nextConfig;
