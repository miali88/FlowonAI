import React from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { motion, AnimatePresence } from "framer-motion";

interface MorphingStreamButtonProps {
  onStreamToggle: () => void;
  isStreaming: boolean;
  showTextBox: boolean;
  isConnecting: boolean; // Add new prop for loading state
}

const MorphingStreamButton: React.FC<MorphingStreamButtonProps> = ({ 
  onStreamToggle, 
  isStreaming, 
  showTextBox,
  isConnecting,
}) => {
  const handleClick = () => {
    onStreamToggle();
  };

  return (
    <Card className="w-full max-w-[300px] bg-transparent border-none shadow-none">
      <CardContent className="p-6 flex flex-col items-center">
        <motion.div
          className="relative mb-4"
          animate={isStreaming ? { width: "160px", height: "60px" } : { width: "120px", height: "120px" }}
          transition={{ duration: 0.5 }}
        >
          <Button
            className="w-full h-full rounded-full bg-cyan-500 text-white hover:bg-cyan-600 focus:ring-2 focus:ring-cyan-400 focus:outline-none overflow-hidden"
            onClick={handleClick}
            disabled={isConnecting} // Disable the button while connecting or disconnecting
          >
            <AnimatePresence mode="wait">
              {isConnecting ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                </motion.div>
              ) : !isStreaming ? (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-12 h-12"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </motion.div>
              ) : (
                <motion.div
                  key="streaming"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <motion.span
                    className="text-sm font-medium"
                    initial={{ width: 0 }}
                    animate={{ width: "auto" }}
                    transition={{ duration: 0.5 }}
                  >
                    Chatting...
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default MorphingStreamButton;