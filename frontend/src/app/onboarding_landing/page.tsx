'use client'

console.log('Page module loading...');

import React from 'react';
import { Header } from "@/components/header"
import { Footer } from '@/components/footer'
import { Particles } from "@/components/magicui/particles"
import Hero from './Hero'
import DataCollect from './DataCollect'
import KeyFeatures from './KeyFeatures'
import StatsSection from './StatsSection'
import Other from './Other'
import WhyUsSection from './WhyUsSection'
import ChatSection from './ChatSection'
import Features from './3Features'
import FAQ from './FAQ'
import CTA from './CTA'
import Solutions from './Solutions'
import Tailor from './Tailor'
import ThreeStep from './3Step'
import ROI from './ROI'
import Forms from './Forms'
import Future from './Future'
import Adaptive from './Adaptive'
import Story from './Story'

export default function Page() {
  console.log('Page component rendering');

  return (
    <div className="overflow-x-hidden relative">
      {/* Test each component individually */}
      <div>Testing Components:</div>
      
      {/* Test 1: Built-in components */}
      <div>Test 1: Basic div</div>
      
      {/* Test 2: Header only */}
      <Header />
      
      {/* Test 3: Particles */}
      <Particles
        ease={70}
        size={0.10}
        color="#ffffff"
        quantity={235}
        staticity={40}
        className="absolute inset-0 -z-10 h-full"
      />
      
      {/* Remove the incorrect curly braces around these components */}
      <Hero />
      <div className="mx-auto max-w-7xl">
        <KeyFeatures />
        <DataCollect />
        <StatsSection />
        <WhyUsSection />
        <ChatSection />
        <Features />
        <FAQ />
        <CTA />
        <Solutions />
        <Tailor />
        <ThreeStep />
        <ROI />
        <Forms />
        <Future />
        <Adaptive />
        <Story />
        <Other />
        {/* <Footer /> */}
      </div>
    </div>
  );
}