import { Card } from "@/components/ui/card";
import { useState } from "react";

interface TokenCounterProps {
  totalTokens: number;
  limit?: number;
}

export function TokenCounter({
  totalTokens,
  limit = 400000,
}: TokenCounterProps) {
  const [showPopup, setShowPopup] = useState(false);
  const percentage = (totalTokens / limit) * 100;
  const isExceedingLimit = totalTokens > limit;

  return (
    <Card
      className="p-4"
      onMouseEnter={() => setShowPopup(isExceedingLimit)}
      onMouseLeave={() => setShowPopup(false)}
    >
      <div className="space-y-2 relative">
        <div className="flex justify-between text-sm">
          <span>Total Tokens Used: </span>
          <span className={isExceedingLimit ? "text-red-500" : ""}>
            &nbsp;{totalTokens.toLocaleString()} / {limit.toLocaleString()}
          </span>
        </div>
        <div className="w-full bg-secondary h-2 rounded-full">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        {isExceedingLimit && <div className="text-red-500 text-sm"></div>}
        {showPopup && (
          <div className="absolute top-[-80px] left-0 p-2 bg-white border border-gray-300 rounded shadow-lg">
            <span className="text-sm text-gray-700">
              Upgrade your plan to increase your token limit.
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
