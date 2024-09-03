import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";

const onboardingData = [
  {
    image: "https://picsum.photos/seed/onboarding1/800/600",
    title: "Welcome to Our App",
    description: "Let's get you started with a quick tour.",
    question: "Ready to begin?"
  },
  {
    image: "https://picsum.photos/seed/onboarding2/800/600",
    title: "Discover Features",
    description: "Explore our powerful tools and capabilities.",
    question: "Want to see what we offer?"
  },
  {
    image: "https://picsum.photos/seed/onboarding3/800/600",
    title: "Personalize Your Experience",
    description: "Tailor the app to your preferences.",
    question: "Shall we customize it for you?"
  },
];

function OnboardingCard({ data, index, isActive, totalCards, currentIndex, onNext }) {
  const offset = (index - currentIndex) * 20; // 20% offset for each card
  
  return (
    <Card 
      className={`w-full max-w-3xl h-[500px] absolute transition-all duration-500 ease-in-out 
        ${isActive ? 'z-10' : `z-${10 - Math.abs(index - currentIndex)}`}
        ${offset >= 0 ? `translate-x-[${offset}%]` : 'opacity-0 -translate-x-full'}`}
      style={{
        transform: `translateX(${offset}%) scale(${1 - Math.abs(index - currentIndex) * 0.05})`,
        boxShadow: `${offset}px 0 10px rgba(0,0,0,0.1)`,
      }}
      onClick={() => index === currentIndex + 1 && onNext()}
    >
      <div className="relative h-full overflow-hidden rounded-lg">
        <img src={data.image} alt={data.title} className="w-full h-full object-cover" />
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-6">
          <h2 className="text-2xl font-bold mb-2">{data.title}</h2>
          <p className="mb-4">{data.description}</p>
          <p className="font-semibold">{data.question}</p>
        </div>
        {isActive && (
          <Button 
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white text-black hover:bg-gray-200"
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            aria-label="Next"
          >
            <ArrowRightIcon className="h-6 w-6" />
          </Button>
        )}
      </div>
      {isActive && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {Array.from({ length: totalCards }).map((_, idx) => (
            <div 
              key={idx} 
              className={`w-2 h-2 rounded-full ${idx === currentIndex ? 'bg-white' : 'bg-gray-400'}`}
              aria-hidden="true"
            ></div>
          ))}
        </div>
      )}
    </Card>
  );
}

function OnboardingPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % onboardingData.length);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      setCurrentIndex((prevIndex) => {
        if (event.key === 'ArrowRight') {
          return (prevIndex + 1) % onboardingData.length;
        } else {
          return (prevIndex - 1 + onboardingData.length) % onboardingData.length;
        }
      });
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.focus();
    }
  }, []);

  return (
    <div 
      className="flex items-center justify-center min-h-screen bg-gray-100 p-4 overflow-hidden"
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Onboarding carousel"
    >
      <div className="relative w-full max-w-3xl h-[500px] perspective-1000">
        {onboardingData.map((data, index) => (
          <OnboardingCard
            key={index}
            data={data}
            index={index}
            isActive={index === currentIndex}
            onNext={handleNext}
            totalCards={onboardingData.length}
            currentIndex={currentIndex}
          />
        ))}
      </div>
    </div>
  );
}

export default OnboardingPage;

