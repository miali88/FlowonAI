// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

if (process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn: "https://cc2789c804c46d7bfb18c31126c34cf5@o4508208175906816.ingest.us.sentry.io/4508208217063424",
    tracesSampleRate: 1,
    debug: false,
  });
}
