'use client';

import { memo } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

interface IndustryCardProps {
  name: string;
  delay: number;
}

const IndustryCard = memo(({ name, delay }: IndustryCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="relative group"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
    <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors duration-300">
      <h3 className="text-lg md:text-xl font-medium text-center">{name}</h3>
    </div>
  </motion.div>
));
IndustryCard.displayName = 'IndustryCard';

export const IndustriesGrid = memo(() => {
  const t = useTranslations('industries');

  const industries = [
    'Pet Services',
    'Professional Services',
    'Contractors',
    'Retail',
    'Auto Services',
    'Beauty & Wellness',
    'Financial Services',
    'Home Services',
    'Medical Clinics',
    'Law Firms',
    'Real Estate',
    'Dental Offices',
  ];

  return (
    <section className="w-full py-24 relative overflow-hidden">
      {/* Background gradient blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute w-[40rem] h-[40rem] rounded-full bg-primary/20 blur-[100px] -top-[20%] -left-[10%] animate-blob" />
        <div className="absolute w-[40rem] h-[40rem] rounded-full bg-secondary/20 blur-[100px] top-[20%] -right-[10%] animate-blob animation-delay-2000" />
        <div className="absolute w-[35rem] h-[35rem] rounded-full bg-cyan-500/20 blur-[100px] -bottom-[10%] -right-[15%] animate-blob animation-delay-4000" />
        <div className="absolute w-[35rem] h-[35rem] rounded-full bg-purple-500/20 blur-[100px] -top-[10%] -right-[15%] animate-blob animation-delay-3000" />
        <div className="absolute w-[35rem] h-[35rem] rounded-full bg-cyan-500/20 blur-[100px] -bottom-[10%] -left-[15%] animate-blob animation-delay-3000" />
        <div className="absolute w-[35rem] h-[35rem] rounded-full bg-purple-500/20 blur-[100px] -top-[10%] -left-[15%] animate-blob animation-delay-4000" />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold"
          >
            {t('title')}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-3xl"
          >
            {t('subtitle')}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {industries.map((industry, index) => (
            <IndustryCard 
              key={industry} 
              name={industry} 
              delay={index * 0.1} 
            />
          ))}
        </div>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.9 }}
          className="text-center text-lg text-muted-foreground mt-12"
        >
          {t('footer')}
        </motion.p>
      </div>
    </section>
  );
});
IndustriesGrid.displayName = 'IndustriesGrid'; 