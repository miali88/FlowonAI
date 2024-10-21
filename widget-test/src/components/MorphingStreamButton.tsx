import React from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

interface MorphingStreamButtonProps {
  onStreamToggle: () => void;
  isStreaming: boolean;
  showTextBox: boolean;
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
    <Card className="w-full max-w-[300px] bg-transparent border-none shadow-none">
      <CardContent className="p-6 flex flex-col items-center">
        <Button
          className="w-[120px] h-[120px] rounded-full bg-cyan-500 text-white hover:bg-cyan-600 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
          onClick={handleClick}
          disabled={isConnecting}
        >
          yowzie
        </Button>
      </CardContent>
    </Card>
  );
};

export default MorphingStreamButton;
