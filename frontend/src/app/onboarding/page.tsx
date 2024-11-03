'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function OnboardingPage() {
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    email: '',
    password: '',
    dataLocation: '',
    receiveUpdates: false,
    agreeToTerms: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-700 flex items-center justify-between p-8">
      {/* Left side content */}
      <div className="text-white max-w-xl px-8">
        <h1 className="text-5xl font-bold mb-6">
          All the tools to fix the code you broke
        </h1>
        <p className="text-lg mb-8">
          Debug any software issue, onboard your team, and integrate with your systems. 
          You get 14 days free on our Business plan to start — no credit card required.
        </p>
        <div>
          <h3 className="text-sm font-semibold mb-4">TRUSTED BY OVER 100K ORGANIZATIONS</h3>
          {/* Add company logos here */}
        </div>
      </div>

      {/* Right side form */}
      <div className="bg-white rounded-lg p-8 max-w-xl w-full">
        <h2 className="text-2xl font-bold mb-6">Get started free</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="Your Name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Organization<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="Organization Name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Email<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className="w-full p-2 border rounded"
                placeholder="you@company.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Password<span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                className="w-full p-2 border rounded"
                placeholder="Password (8+ characters)"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Data Storage Location<span className="text-red-500">*</span>
            </label>
            <select className="w-full p-2 border rounded" required>
              <option value="">Select a location</option>
              <option value="us">United States</option>
              <option value="eu">European Union</option>
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <label className="text-sm">I would like to receive updates via email.</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="mr-2" required />
              <label className="text-sm">
                I agree to the <Link href="/terms" className="text-purple-600">Terms of Service</Link> and{' '}
                <Link href="/privacy" className="text-purple-600">Privacy Policy</Link>.
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-pink-500 text-white py-2 rounded hover:bg-pink-600 transition"
          >
            CREATE YOUR ACCOUNT
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">OR SIGN UP WITH</p>
            <div className="flex justify-center gap-4 mt-4">
              <button className="border rounded px-4 py-2 flex items-center gap-2">
                <span>GOOGLE</span>
              </button>
              <button className="border rounded px-4 py-2 flex items-center gap-2">
                <span>GITHUB</span>
              </button>
              <button className="border rounded px-4 py-2 flex items-center gap-2">
                <span>AZURE DEVOPS</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
