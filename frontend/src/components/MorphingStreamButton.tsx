import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

const MorphingStreamButton = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversation, setConversation] = useState([]);

  const toggleStreaming = () => {
    setIsStreaming(!isStreaming);
    if (!isStreaming) {
      const messages = [
        { role: "user", content: "Hello, how are you?" },
        { role: "ai", content: "I'm just an AI, I don't have emotions. How can I assist you today?" },
      ];
      streamConversation(messages);
    }
  };

  const streamConversation = async (messages) => {
    for (let message of messages) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setConversation((prev) => [...prev, message]);
    }
  };

  return (
    <Card className="w-full max-w-[300px]">
      <CardContent className="p-6 flex flex-col items-center">
        <motion.div
          className="relative mb-4"
          animate={isStreaming ? { width: "160px", height: "60px" } : { width: "120px", height: "120px" }}
          transition={{ duration: 0.5 }}
        >
          <Button
            className="w-full h-full rounded-full bg-indigo-500 text-white hover:bg-indigo-600 focus:ring-2 focus:ring-indigo-400 focus:outline-none overflow-hidden"
            onClick={toggleStreaming}
          >
            <AnimatePresence mode="wait">
              {!isStreaming ? (
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
                    Streaming...
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
        <div className="w-full mt-4 space-y-2">
          <AnimatePresence>
            {conversation.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className={`p-2 rounded-lg ${
                  message.role === "user"
                    ? "bg-indigo-100 text-indigo-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};

export default MorphingStreamButton;