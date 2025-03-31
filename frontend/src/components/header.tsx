"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Globe } from "lucide-react";
import { useTranslations } from 'next-intl';

export function Header({ locale = "en" }: { locale?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const t = useTranslations('header');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Determine the link for language switching
  const alternateLocale = locale === "es" ? "en" : "es";
  const currentPath = pathname.replace(/^\/[^/]+/, '') || '/';
  const languageSwitchHref = `/${alternateLocale}${currentPath}`;
  const languageSwitchText = locale === "es" ? "English" : "Español";

  return (
    <header className={`fixed left-0 top-0 z-50 w-full translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:600ms] backdrop-blur-[12px] transition-all duration-150 
      ${scrolled ? "border-b" : "border-b-0"}`}>
      <div className="mx-auto max-w-7xl px-6 sm:px-6 lg:px-8">
        <div className="flex h-[4.5rem] items-center justify-between pt-2">
          {/* Left side - Logo + Name */}
          <Link href={`/${locale}`} className="flex items-center">
            <Image 
              src="/flowon_circle.png"
              alt={t('logoAlt')}
              width={32}
              height={32}
              priority
            />
            <span className="ml-2 text-xl font-medium">{t('siteTitle')}</span>
          </Link>

          {/* Language switcher */}
          <div className="ml-auto flex items-center gap-4">
            <Link 
              href={languageSwitchHref}
              className="flex items-center text-sm font-medium hover:text-gray-900"
            >
              <Globe className="h-4 w-4 mr-1" />
              {languageSwitchText}
            </Link>
            <Link
              href={`/sign-in`}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              {t('signIn')}
            </Link>
          </div>

          {/* Mobile Navigation removed */}
        </div>
      </div>
    </header>
  );
}