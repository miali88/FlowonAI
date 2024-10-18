'use client';

import * as React from 'react';

interface InputColorProps {
  value: string;
  onChange: (color: string) => void;
}

export function InputColor({ value, onChange }: InputColorProps) {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 p-0 border-0"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 w-24"
      />
    </div>
  );
}

