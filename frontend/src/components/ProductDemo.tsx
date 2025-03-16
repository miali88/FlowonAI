'use client';

import { useEffect, useRef, useState } from 'react';

export const ProductDemo = () => {
  const steps = [
    {
      title: "Step 1: Simply enter business name",
      video: "/product_clips/1_business_name.mp4",
      description: "Get started by entering your business name - it's that simple."
    },
    {
      title: "Step 2: Review your automatically generated business information",
      video: "/product_clips/2_business_info.mp4",
      description: "Our AI automatically generates relevant business information for verification."
    },
    {
      title: "Step 3: Have your agent ask specific questions on the call",
      video: "/product_clips/3_ask_specific_questions.mp4",
      description: "Watch as your AI agent intelligently handles customer inquiries with specific, relevant questions."
    },
  ];

  return (
    <section className="bg-gray-50 py-40">
      <div className="max-w-[2000px] mx-auto px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-32">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Set up in minutes, no IT team needed
          </h2>
          <p className="max-w-[85%] md:max-w-[65%] text-muted-foreground text-lg md:text-xl">
            Our guided setup process makes it easy to get started
          </p>
        </div>
        
        <div className="space-y-64">
          {steps.map((step, index) => (
            <VideoSection 
              key={index}
              {...step}
              stepNumber={index + 1}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const VideoSection = ({ 
  title, 
  video, 
  description, 
  stepNumber, 
  isLast 
}: { 
  title: string;
  video: string;
  description: string;
  stepNumber: number;
  isLast: boolean;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const videoElement = videoRef.current;
    const sectionElement = sectionRef.current;

    if (!videoElement || !sectionElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoElement.play().catch(() => {
              console.log('Autoplay prevented - user interaction may be required');
            });
          } else {
            videoElement.pause();
            videoElement.currentTime = 0;
          }
        });
      },
      {
        threshold: 0.5,
      }
    );

    observer.observe(sectionElement);

    return () => {
      observer.unobserve(sectionElement);
    };
  }, []);

  return (
    <div 
      ref={sectionRef}
      className="max-w-[1600px] mx-auto"
    >
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div className={`order-2 md:order-${stepNumber % 2 ? 2 : 1} max-w-xl px-8`}>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white text-lg font-medium">
                {stepNumber}
              </span>
              <h3 className="text-3xl font-bold">{title}</h3>
            </div>
            <p className="text-gray-600 text-xl leading-relaxed">
              {description}
            </p>
          </div>
        </div>
        
        <div className={`order-1 md:order-${stepNumber % 2 ? 1 : 2} px-8`}>
          <div className="relative w-full rounded-xl overflow-hidden shadow-2xl bg-black">
            <div className="relative pt-[56.25%]">
              {isMounted && (
                <video
                  ref={videoRef}
                  src={video}
                  className="absolute inset-0 w-full h-full object-cover"
                  controls
                  loop
                  muted
                  playsInline
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 