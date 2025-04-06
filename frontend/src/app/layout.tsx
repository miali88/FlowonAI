import localFont from "next/font/local";
import "./globals.css";
import { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Providers } from './providers';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from '@/lib/get-messages';
import { Toaster } from 'sonner';

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
    function setTheme(theme) {
      document.documentElement.classList.remove('dark', 'white');
      if (theme) {
        document.documentElement.classList.add(theme);
      }
    }

    // Try to get saved theme
    try {
      const savedTheme = localStorage.getItem('flowon-theme-mode');
      if (savedTheme) {
        setTheme(savedTheme);
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
      }
    } catch (e) {
      console.error('Error setting theme:', e);
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
        <Script id="vector-script" strategy="afterInteractive">
          {`
            !function(e,r){try{if(e.vector)return void console.log("Vector snippet included more than once.");var t={};t.q=t.q||[];for(var o=["load","identify","on"],n=function(e){return function(){var r=Array.prototype.slice.call(arguments);t.q.push([e,r])}},c=0;c<o.length;c++){var a=o[c];t[a]=n(a)}if(e.vector=t,!t.loaded){var i=r.createElement("script");i.type="text/javascript",i.async=!0,i.src="https://cdn.vector.co/pixel.js";var l=r.getElementsByTagName("script")[0];l.parentNode.insertBefore(i,l),t.loaded=!0}}catch(e){console.error("Error loading Vector:",e)}}(window,document);
            vector.load("26ab1365-f185-41e3-bb0a-b394fda5b685");
          `}
        </Script>
      </head>
      <body suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            {children}
            <Toaster position="bottom-right" />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
