"use client";

import { useEffect } from "react";

// Animation component for the moving gradient blob
export default function BlobAnimation() {
  useEffect(() => {
    // Create animation for the blobs using CSS variables
    const blobs = document.querySelectorAll('.blob');
    
    blobs.forEach((blob) => {
      // Randomize initial positions
      const randomX = Math.random() * 100;
      const randomY = Math.random() * 100;
      
      blob.animate(
        [
          { transform: `translate(${randomX}px, ${randomY}px) scale(1)` },
          { transform: `translate(${randomX + 50}px, ${randomY - 50}px) scale(1.1)` },
          { transform: `translate(${randomX - 30}px, ${randomY + 40}px) scale(0.9)` },
          { transform: `translate(${randomX + 20}px, ${randomY + 30}px) scale(1.05)` },
          { transform: `translate(${randomX}px, ${randomY}px) scale(1)` },
        ],
        {
          duration: 15000 + Math.random() * 10000, // Random duration between 15-25s
          iterations: Infinity,
          easing: 'ease-in-out'
        }
      );
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-black opacity-30 z-0"></div>
      
      {/* Cyan blob */}
      <div className="blob absolute w-96 h-96 rounded-full bg-cyan-500 opacity-30 blur-3xl top-1/4 -left-20 z-0"></div>
      
      {/* Smaller cyan blob */}
      <div className="blob absolute w-64 h-64 rounded-full bg-cyan-400 opacity-20 blur-2xl bottom-1/3 right-20 z-0"></div>
      
      {/* Purple blob */}
      <div className="blob absolute w-96 h-96 rounded-full bg-purple-600 opacity-30 blur-3xl -bottom-20 right-1/4 z-0"></div>
      
      {/* Smaller purple blob */}
      <div className="blob absolute w-72 h-72 rounded-full bg-purple-500 opacity-20 blur-2xl top-20 right-1/3 z-0"></div>
      
      {/* Mixed color blob */}
      <div className="blob absolute w-80 h-80 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 opacity-25 blur-3xl top-1/2 left-1/3 z-0"></div>
    </div>
  );
} 