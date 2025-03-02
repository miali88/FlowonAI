"use client"

import Image from "next/image";

// Array of provided image URLs
const testimonialImages = [
  "https://framerusercontent.com/images/pW5C1xlFPIVTasi1A9arFHgjDVE.png",
  "https://framerusercontent.com/images/2fSYQXPIubGVqONjp7lgljb0Hc.png",
  "https://framerusercontent.com/images/RcvAUiYw0B1oa69I2nSut6r65U.png",
  "https://framerusercontent.com/images/ls0KtTJ2CpxSWwcgvkQYbQAkwQ.png",
  "https://framerusercontent.com/images/8DVBJntkqROQjfR56LqBoBANo.png",
  "https://framerusercontent.com/images/FwldMMGR3HWZmQdM3ohiWlbuA.png",
  "https://framerusercontent.com/images/eIR7mgs9O9LsfpEpAYqnLSIWnA.png",
  "https://framerusercontent.com/images/0EDCSFRGJvjpmA3ppQErnAhiVXs.png",
  "https://framerusercontent.com/images/M80srNSAANoXyk6lnDBbFcWrkXg.png",
  "https://framerusercontent.com/images/iphkQVDTeSilueYXtnsoUihro.png",
  "https://framerusercontent.com/images/kqbt75ZCGXO9O1iMmsL7KN3sG2A.png",
  "https://framerusercontent.com/images/pHLWFjMOWJf07VOm1tjhmQm6qE.png",
  "https://framerusercontent.com/images/GCxkbT2akiEinxEWMUJnJv3mVgc.png",
  "https://framerusercontent.com/images/5XtCpqz6ZnNvR2RVGLSll2ykiLo.png",
  "https://framerusercontent.com/images/lCBSkNISuUn15KKQQdO9PKLdk0.png",
];

// CSS-based infinite marquee scroll component
export function CarouselTestimonials() {
  return (
    <section className="w-full py-12 overflow-hidden bg-muted/30">
      <div className="container mb-6">
        <h2 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl text-center">
          Some of our happy clients...
        </h2>
      </div>

      <div className="relative w-full">
        {/* Add gradient fade effect on edges */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-muted/30 to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-muted/30 to-transparent z-10" />

        <div className="w-full overflow-hidden">
          <div className="flex animate-marquee-horizontal" style={{ minWidth: '200%' }}>
            {/* First set of images */}
            {testimonialImages.map((imageUrl, index) => (
              <div 
                key={`first-${index}`} 
                className="mx-4 flex-none"
                style={{ width: '120px' }}
              >
                <div className="h-full flex items-center justify-center">
                  <div className="relative w-full h-12">
                    <Image 
                      src={imageUrl} 
                      alt={`Client logo ${index + 1}`} 
                      fill
                      className="object-contain"
                      sizes="120px"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            {/* Duplicate set for seamless looping */}
            {testimonialImages.map((imageUrl, index) => (
              <div 
                key={`second-${index}`} 
                className="mx-4 flex-none"
                style={{ width: '120px' }}
              >
                <div className="h-full flex items-center justify-center">
                  <div className="relative w-full h-12">
                    <Image 
                      src={imageUrl} 
                      alt={`Client logo ${index + 1}`} 
                      fill
                      className="object-contain"
                      sizes="120px"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 