import React from 'react';

interface MicIconProps {
  size?: number;
  className?: string;
}

const MicIcon: React.FC<MicIconProps> = ({ size = 24, className = '' }) => {
  return (
    <div 
      className={`flex items-center justify-center rounded-full bg-purple-500 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2C10.3431 2 9 3.34315 9 5V11C9 12.6569 10.3431 14 12 14C13.6569 14 15 12.6569 15 11V5C15 3.34315 13.6569 2 12 2ZM7 11C7 13.7614 9.23858 16 12 16C14.7614 16 17 13.7614 17 11H19C19 14.6124 16.3304 17.6219 13 17.9646V21H11V17.9646C7.66962 17.6219 5 14.6124 5 11H7Z"
          fill="white"
        />
      </svg>
    </div>
  );
};

export default MicIcon;