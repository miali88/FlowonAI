'use client';

import React from 'react';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Particles } from "@/components/magicui/particles";
import Link from 'next/link';
import { BlogThumbnail } from '@/app/blogs/BlogThumbnail';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  slug: string;
  readTime: string;
  category?: string;
}

const blogPosts: BlogPost[] = [
    {
      id: 1,
      title: 'The Future of Customer Service: How AI Voice Assistants Are Revolutionizing Business Interactions',
      excerpt: 'Discover how AI voice assistants are transforming customer service, from 24/7 availability to personalized interactions, and learn why businesses are rapidly adopting this revolutionary technology...',
      category: 'AI Technology',
      date: '2024-03-20',
      slug: 'the-future-of-customer-service',
      readTime: '10 min read'
    },
    {
      id: 2,
      title: '24/7 Customer Support Without the Overhead: A Deep Dive into AI-Powered Conversational Platforms',
      excerpt: 'Explore how businesses are achieving round-the-clock customer support while significantly reducing operational costs through AI-powered conversational platforms...',
      category: 'Business Strategy',
      date: '2024-03-21',
      slug: '247',
      readTime: '12 min read'
    },
    {
      id: 3,
      title: 'Lead Generation Reimagined: How AI Voice Assistants Qualify and Capture Potential Customers',
      excerpt: 'Learn how AI voice assistants are transforming lead generation with intelligent qualification, enhanced user experience, and data-driven insights that drive better conversion rates...',
      category: 'Lead Generation',
      date: '2024-03-22',
      slug: 'lead-generation-reimagined',
      readTime: '10 min read'
    }
  ];

export default function BlogsPage() {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <main className="w-full relative">
          <Particles
            ease={70}
            size={0.10}
            color="#ffffff"
            quantity={235}
            staticity={40}
            className="absolute inset-0 -z-10 h-full"
          />
          
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
            <div className="mb-16">
              <h1 className="text-4xl font-bold text-white mb-4">
                Blog
              </h1>
              <p className="text-gray-400">
                Learn more about Flowon AI through our blog!
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((blogPost) => (
                <Link href={`/blogs/${blogPost.slug}`} key={blogPost.id} className="group">
                  <article className="bg-white/5 hover:bg-white/10 transition-all duration-300 rounded-lg overflow-hidden h-full flex flex-col">
                    <div className="relative aspect-[16/9] w-full">
                      <BlogThumbnail category={blogPost.category} />
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <h2 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors duration-300 mb-3">
                        {blogPost.title}
                      </h2>
                      <p className="text-gray-400 text-sm mb-4 flex-grow">
                        {blogPost.excerpt}
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <span>{blogPost.readTime}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }