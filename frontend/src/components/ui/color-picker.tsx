'use client';

import * as React from 'react';
import { InputColor } from './input-color';

export const DEFAULT_COLOR = '#000000';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  showAlpha?: boolean;
  showHue?: boolean;
  showColorPreview?: boolean;
  showInputs?: boolean;
  showEyeDropper?: boolean;
}

export function ColorPicker({
  value,
  onChange,
  showInputs = true,
  showColorPreview = true,
}: ColorPickerProps) {
  return (
    <div className="flex items-center space-x-2">
      {showColorPreview && (
        <div
          className="w-8 h-8 rounded-full border border-gray-300"
          style={{ backgroundColor: value }}
        />
      )}
      {showInputs && (
        <InputColor value={value} onChange={onChange} />
      )}
    </div>
  );
}

