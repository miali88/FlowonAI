import React from 'react';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata = {
  title: 'Flowon AI Blog',
  description: 'Insights and articles about AI technology and innovation',
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-20">
        {children}
      </div>
      <Footer />
    </div>
  );
}
