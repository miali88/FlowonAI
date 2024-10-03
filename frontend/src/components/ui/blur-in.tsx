"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface BlurIntProps {
  word: string | React.ReactNode;  // Updated to allow ReactNode for JSX content
  className?: string;
  variant?: {
    hidden: { filter: string; opacity: number };
    visible: { filter: string; opacity: number };
  };
  duration?: number;
}

const BlurIn = ({ word, className, variant, duration = 1 }: BlurIntProps) => {
  const defaultVariants = {
    hidden: { filter: "blur(10px)", opacity: 0 },
    visible: { filter: "blur(0px)", opacity: 1 },
  };
  const combinedVariants = variant || defaultVariants;

  return (
    <motion.div  // Changed from motion.h1 to motion.div for more flexibility
      initial="hidden"
      animate="visible"
      transition={{ duration }}
      variants={combinedVariants}
      className={cn(
        "font-display text-center text-4xl font-bold tracking-[-0.02em] drop-shadow-sm md:text-7xl md:leading-[5rem] mb-16",  // Added mb-16 for bottom margin
        className,
      )}
    >
      {word}
    </motion.div>
  );
};

export default BlurIn;
