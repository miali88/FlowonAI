'use client';

import Link from "next/link";
import { Youtube, Twitter } from "lucide-react";
import { useState, useEffect } from 'react';
import Image from "next/image";

interface GeoData {
  country: string;
  country_code: string;
}

export function Footer() {
  const [countryCode, setCountryCode] = useState<string>('');

  useEffect(() => {
    const fetchGeoData = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) throw new Error('Failed to fetch location data');
        const data: GeoData = await response.json();
        setCountryCode(data.country_code);
      } catch (err) {
        console.error('Error fetching location:', err);
      }
    };

    fetchGeoData();
  }, []);

  return (
    <footer className="w-full">
      <div className="mx-auto max-w-4xl px-4">
        <div className="flex flex-col md:flex-row justify-between py-8 gap-8">
          <div className="flex flex-col gap-4 items-center md:items-start">
            <Link href="/" className="flex gap-2">
              <Image 
                alt="Flowon AI Logo" 
                src="/flowon.png" 
                width={32}
                height={32}
                className="invert" 
              />
            </Link>
            <p className="max-w-xs"> </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:gap-6 sm:grid-cols-3">
            <div>
              <h2 className="mb-6 text-sm tracking-tighter font-medium uppercase">Legal</h2>
              <ul className="gap-2 grid list-none">
                <li>
                  <Link
                    href="/terms"
                    className="cursor-pointer text-muted-foreground hover:text-foreground/80 duration-200 font-[450] text-sm"
                  >
                    Terms
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="cursor-pointer text-muted-foreground hover:text-foreground/80 duration-200 font-[450] text-sm"
                  >
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 border-t border-neutral-700/20 py-4">
          {countryCode && (
            <div className="text-sm text-muted-foreground">
              Connecting from: {countryCode}
            </div>
          )}
          <div className="flex space-x-5 justify-center">
            <a href="#" className="text-muted-foreground hover:text-muted-foreground/80">
              <Youtube size={15} />
              <span className="sr-only">Youtube</span>
            </a>
            <a href="#" className="text-muted-foreground hover:text-muted-foreground/80">
              <Twitter size={15} />
              <span className="sr-only">Twitter</span>
            </a>
          </div>
          <div className="flex flex-row justify-center text-sm text-muted-foreground gap-1">
            <span>© 2024 </span>
            <Link href="/" className="cursor-pointer">
              Flowon AI
            </Link>
            <span>, All Rights Reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
