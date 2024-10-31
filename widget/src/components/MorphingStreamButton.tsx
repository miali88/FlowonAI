import React from "react";

interface MorphingStreamButtonProps {
  onStreamToggle: () => void;
  isStreaming: boolean;
  isConnecting: boolean;
}

const MorphingStreamButton: React.FC<MorphingStreamButtonProps> = ({ 
  onStreamToggle, 
  isConnecting,
}) => {
  const handleClick = () => {
    onStreamToggle();
  };

  return (
    <div className="w-full max-w-[300px]">
      <div className="p-6 flex flex-col items-center">
        <button
          className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-gray-200 to-gray-400 text-gray-800 
            hover:from-gray-300 hover:to-gray-500 focus:ring-2 focus:ring-gray-300 focus:outline-none
            shadow-lg backdrop-blur-md border border-gray-300
            transition-all duration-200 ease-in-out
            disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleClick}
          disabled={isConnecting}
        >
          Start Chat
        </button>
      </div>
    </div>
  );
};

export default MorphingStreamButton;
