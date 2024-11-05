"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AnimatedMobileNavbar } from "@/components/animated-mobile-navbar";
import { useEffect, useState } from "react";
import Image from "next/image";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed left-0 top-0 z-50 w-full translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:600ms] backdrop-blur-[12px] transition-all duration-150 
      ${scrolled ? "border-b" : "border-b-0"}`}>
      <div className="mx-auto max-w-7xl px-6 sm:px-6 lg:px-8">
        <div className="flex h-[4.5rem] items-center justify-between pt-2">
          {/* Left side - Logo + Name */}
          <Link href="/" className="flex items-center">
            <Image 
              src="/flowon_partial.png"
              alt="Flowon AI Logo"
              width={32}
              height={32}
              className="h-8 w-8 invert"
              priority
            />
            <span className="ml-2 text-xl font-medium">Flowon AI</span>
          </Link>

          {/* Right side - Desktop Nav */}
          <div className="ml-auto hidden md:flex items-center gap-4">
            <Link 
              href="/dashboard" 
              className="text-sm font-medium hover:text-gray-900"
            >
              Log in
            </Link>
            <Button asChild variant="secondary" className="text-sm">
              <Link href="/dashboard">Sign up</Link>
            </Button>
          </div>

          <AnimatedMobileNavbar>
            <motion.nav
              exit={{ scale: 1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              initial={{ scale: 1, opacity: 0 }}
              transition={{ ease: "easeOut", duration: 0.2 }}
              className="fixed left-0 top-[3.5rem] z-50 h-[calc(100vh-3.5rem)] w-full overflow-auto bg-background backdrop-blur-[12px]"
            >
              <ul className="flex flex-col md:flex-row md:items-center uppercase md:normal-case ease-in">
                <motion.li
                  exit={{ y: "-20px", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  initial={{ y: "-20px", opacity: 0 }}
                  transition={{ ease: "easeOut", duration: 0.2 }}
                  className="pl-6 py-0.5 border-b md:border-none"
                >
                  <Link
                    href="#"
                    className="flex h-[3.5rem] w-full items-center text-xl transition-[color,transform] duration-300 md:translate-y-0 md:text-sm md:transition-colors"
                  >
                    Features
                  </Link>
                </motion.li>
                <motion.li
                  exit={{ y: "-20px", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  initial={{ y: "-20px", opacity: 0 }}
                  transition={{ ease: "easeOut", duration: 0.2 }}
                  className="pl-6 py-0.5 border-b md:border-none"
                >
                  <Link
                    href="#"
                    className="flex h-[3.5rem] w-full items-center text-xl transition-[color,transform] duration-300 md:translate-y-0 md:text-sm md:transition-colors"
                  >
                    Pricing
                  </Link>
                </motion.li>
                <motion.li
                  exit={{ y: "-20px", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  initial={{ y: "-20px", opacity: 0 }}
                  transition={{ ease: "easeOut", duration: 0.2 }}
                  className="pl-6 py-0.5 border-b md:border-none"
                >
                  <Link
                    href="#"
                    className="flex h-[3.5rem] w-full items-center text-xl transition-[color,transform] duration-300 md:translate-y-0 md:text-sm md:transition-colors"
                  >
                    Careers
                  </Link>
                </motion.li>
                <motion.li
                  exit={{ y: "-20px", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  initial={{ y: "-20px", opacity: 0 }}
                  transition={{ ease: "easeOut", duration: 0.2 }}
                  className="pl-6 py-0.5 border-b md:border-none"
                >
                  <Link
                    href="#"
                    className="flex h-[3.5rem] w-full items-center text-xl transition-[color,transform] duration-300 md:translate-y-0 md:text-sm md:transition-colors"
                  >
                    Contact Us
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