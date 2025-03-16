'use client';

import { useEffect, useRef, useState } from 'react';

interface LazyVideoProps {
  src: string;
  className?: string;
  controls?: boolean;
}

const LazyVideo = ({ src, className = '', controls = false }: LazyVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (videoRef.current) {
            videoRef.current.load();
          }
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
      }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className={className}
      controls={controls}
      playsInline
      preload="none"
    >
      {isVisible && <source src={src} type="video/mp4" />}
    </video>
  );
};

export default LazyVideo; 