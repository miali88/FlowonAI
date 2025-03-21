import { withSentryConfig } from "@sentry/nextjs";
// Import next-intl as a default import
import nextIntl from "next-intl/plugin";

// Create the next-intl plugin with the standard location
const withNextIntl = nextIntl();

/** @type {import('next').NextConfig} */
const nextConfig = {
  publicRuntimeConfig: {
    GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "frame-ancestors *",
              "frame-src *",
              "script-src * 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com",
              "worker-src 'self' blob: data:",
              "connect-src *",
              "style-src * 'self' 'unsafe-inline'",
              "img-src * data: blob: 'self'",
              "media-src * data: blob: 'self'",
              "default-src * 'self'",
            ].join("; "),
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-Requested-With, Content-Type, Authorization",
          },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    // Add warning ignores for OpenTelemetry and require-in-the-middle
    config.ignoreWarnings = [
      { module: /@opentelemetry\/instrumentation/ },
      { module: /require-in-the-middle/ },
    ];

    // Existing webpack config for audio files
    config.module.rules.push({
      test: /\.(ogg|mp3|wav|mpe?g)$/i,
      exclude: config.exclude,
      use: [
        {
          loader: "url-loader",
          options: {
            limit: config.inlineImageLimit,
            fallback: "file-loader",
            outputPath: `${isServer ? "../" : ""}static/images/`,
            name: "[name]-[hash].[ext]",
            esModule: config.esModule || false,
          },
        },
      ],
    });
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.aceternity.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "framerusercontent.com",
        pathname: "/**",
      },
    ],
    domains: ["assets.aceternity.com", "framerusercontent.com"],
  },
  // Disable TypeScript and ESLint during the build process
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    NEXT_PUBLIC_GOOGLE_PLACES_API_KEY:
      process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY,
  },
};

// Sentry configuration
const sentryWebpackPluginOptions = {
  silent: true, // Suppresses all logs
  ignoreErrors: true,
  include: '.',
  ignore: ['node_modules'],
  configFile: 'sentry.properties',
  sourcemaps: {
    disable: true, // Temporarily disable source maps
  }
};

// Apply plugins in the correct order
export default withSentryConfig(
  withNextIntl({
    ...nextConfig,
    productionBrowserSourceMaps: false, // Disable browser source maps in production
    swcMinify: true, // Use SWC minifier instead of Terser
  }),
  sentryWebpackPluginOptions
); 