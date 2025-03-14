import React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { SiGmail } from 'react-icons/si';
import { MdOutlineMail } from 'react-icons/md';

// Glassmorphic container component
const GlassmorphicContainer = ({ children, color }: { children: React.ReactNode, color: string }) => (
  <div className="relative w-full max-w-md mx-auto my-4">
    <div className={`rounded-xl p-4 ${color} bg-opacity-70 backdrop-filter backdrop-blur-lg shadow-lg border border-white border-opacity-20`}>
      {children}
    </div>
  </div>
);

// Notification header component
const NotificationHeader = ({ sender, time }: { sender: string, time: string }) => (
  <div className="flex justify-between items-center mb-1">
    <span className="font-semibold text-black">{sender}</span>
    <span className="text-xs text-gray-700">{time}</span>
  </div>
);

export const EmailNotifications = () => {
  // Get translations
  const t = useTranslations('emailNotifications');

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          {t('sectionTitle')}
        </h2>
        <p className="text-center text-gray-600 mb-10 max-w-3xl mx-auto">
          {t('sectionSubtitle')}
        </p>

        <div className="flex flex-col md:flex-row md:justify-center gap-8 items-center">
          {/* Gmail Notification */}
          <GlassmorphicContainer color="bg-blue-200">
            <div className="flex gap-3">
              <div className="shrink-0 mt-1">
                <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center">
                  <SiGmail size={24} color="#EA4335" />
                </div>
              </div>
              <div className="flex-1">
                <NotificationHeader sender={t('gmail.sender')} time={t('gmail.time')} />
                <div className="font-semibold text-black">{t('gmail.subject')}</div>
                <p className="text-gray-700 text-sm">
                  {t('gmail.message')}
                </p>
              </div>
            </div>
          </GlassmorphicContainer>

          {/* Outlook Notification */}
          <GlassmorphicContainer color="bg-blue-300">
            <div className="flex gap-3">
              <div className="shrink-0 mt-1">
                <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center">
                  <MdOutlineMail size={24} color="#0078D4" />
                </div>
              </div>
              <div className="flex-1">
                <NotificationHeader sender={t('outlook.sender')} time={t('outlook.time')} />
                <div className="font-semibold text-black">{t('outlook.subject')}</div>
                <p className="text-gray-700 text-sm">
                  {t('outlook.message')}
                </p>
              </div>
            </div>
          </GlassmorphicContainer>
        </div>
      </div>
    </section>
  );
}; 