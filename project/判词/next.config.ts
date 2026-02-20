import type { NextConfig } from "next";

const repoName = "The-Judgment-of-Dream-of-the-Red-Chamber";
const isGithubActions = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  ...(isGithubActions
    ? {
        basePath: `/${repoName}`,
        assetPrefix: `/${repoName}/`
      }
    : {})
};

export default nextConfig;
