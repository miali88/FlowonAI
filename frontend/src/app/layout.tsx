import localFont from "next/font/local";
import "./globals.css";
import { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Providers } from './providers';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from '@/lib/get-messages';

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

export const metadata: Metadata = {
  title: 'Flowon AI - Helping you always be there for your customers',
  description: 'Flowon answers calls when you cannot. Ready to qualify new leads, provide answers, take messages, set appointments, and notifies you all the while.',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

// Script to prevent flash of unstyled content
const preventFOUCScript = `
  (function() {
    // Try to get saved theme
    let savedTheme;
    try {
      savedTheme = localStorage.getItem('flowon-theme-mode');
    } catch (e) {}
    
    // Apply appropriate class
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'white') {
      document.documentElement.classList.add('white');
    }
  })();
`;

export default async function RootLayout({
  children,
  params = { locale: 'en' }, // Default locale to English
}: {
  children: React.ReactNode;
  params?: { locale?: string };
}) {
  // Get locale from params or default to 'en'
  const locale = params.locale || 'en';
  
  // Get messages for the current locale
  const messages = await getMessages(locale);

  return (
    <html lang={locale} suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        {/* Script to prevent FOUC */}
        <script
          dangerouslySetInnerHTML={{ __html: preventFOUCScript }}
        />
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
        <Script id="crisp-chat" strategy="afterInteractive">
          {`
            window.$crisp=[];
            window.CRISP_WEBSITE_ID="871ef7f1-e100-437f-b30c-f82719eaa211";
            (function(){
              d=document;
              s=d.createElement("script");
              s.src="https://client.crisp.chat/l.js";
              s.async=1;
              d.getElementsByTagName("head")[0].appendChild(s);
            })();
          `}
        </Script>
      </head>
      <body suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
