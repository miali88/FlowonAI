"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AnimatedMobileNavbar } from "@/components/animated-mobile-navbar";
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
          </div>

          {/* Mobile Navigation */}
          <AnimatedMobileNavbar>
            <motion.nav
              exit={{ scale: 1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              initial={{ scale: 1, opacity: 0 }}
              transition={{ ease: "easeOut", duration: 0.2 }}
              className="fixed left-0 top-[3.5rem] z-50 h-[calc(100vh-3.5rem)] w-full overflow-auto bg-background backdrop-blur-[12px]"
            >
              <ul className="flex flex-col md:flex-row md:items-center">
                <motion.li
                  exit={{ y: "-20px", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  initial={{ y: "-20px", opacity: 0 }}
                  transition={{ ease: "easeOut", duration: 0.2 }}
                  className="pl-6 py-2"
                >
                  <Link
                    href={languageSwitchHref}
                    className="flex h-12 w-full items-center text-lg font-medium"
                  >
                    <Globe className="h-5 w-5 mr-2" />
                    {languageSwitchText}
                  </Link>
                </motion.li>
              </ul>
            </motion.nav>
          </AnimatedMobileNavbar>
        </div>
      </div>
    </header>
  );
}