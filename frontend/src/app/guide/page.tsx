'use client'

import React from 'react';
import Sidebar from './Sidebar';

export default function Page() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">The Future of Customer Service</h1>
        <p>
          Welcome to the blog about the future of customer service. Here, we explore the latest trends and technologies shaping the industry.
        </p>
        {/* Add more content as needed */}
      </main>
    </div>
  );
}