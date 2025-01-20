import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from 'next-themes';
import { Metadata } from 'next';
import Script from 'next/script';
import { CSPostHogProvider } from './providers';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Add this near your other const declarations, outside the RootLayout function
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export const metadata: Metadata = {
  title: 'Flowon AI - Experience AI Conversations That Feel Human',
  description: 'Step into the future of conversational AI. Experience natural, fluid conversations that adapt to your needs, making AI interactions feel remarkably human.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <Script
          id="Cookiebot"
          src="https://consent.cookiebot.com/uc.js"
          data-cbid="211f602c-95ff-4293-8103-42d32dd172fb"
          type="text/javascript"
          strategy="afterInteractive"
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-HTNKTL606H"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-HTNKTL606H');
          `}
        </Script>
      </head>
      <body suppressHydrationWarning>
        <CSPostHogProvider>
          <ClerkProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
            >
              <Elements stripe={stripePromise}>
                {children}
              </Elements>
            </ThemeProvider>
          </ClerkProvider>
        </CSPostHogProvider>
      </body>
    </html>
  );
}
