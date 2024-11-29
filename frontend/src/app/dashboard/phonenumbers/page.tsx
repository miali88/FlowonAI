'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function PhoneNumbersPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold">Phone Numbers</span>
        </div>
        <Button variant="default" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center flex-1 p-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12" y2="18" />
          </svg>
        </div>
        <p className="mt-4 text-gray-600">You don't have any phone numbers</p>
      </div>
    </div>
  );
}