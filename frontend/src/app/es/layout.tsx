import { Metadata } from 'next';
import { Providers } from '../providers';

export const metadata: Metadata = {
  title: 'Flowon AI - Respuesta telefónica con IA para tu negocio',
  description: 'Crea tus propios agentes de chatbot con Flowon AI. Nuestra plataforma te permite crear, entrenar y desplegar tus propios agentes de chatbot con facilidad.',
  icons: {
    icon: '/favicon.ico',
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function ESLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
} 