import { Card } from "@/components/ui/card"

interface TokenCounterProps {
  totalTokens: number;
  limit?: number;
}

export function TokenCounter({ totalTokens, limit = 400000 }: TokenCounterProps) {
  const percentage = (totalTokens / limit) * 100;
  
  return (
    <Card className="p-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Total Tokens Used: </span>
          <span>&nbsp;{totalTokens.toLocaleString()} / {limit.toLocaleString()}</span>
        </div>
        <div className="w-full bg-secondary h-2 rounded-full">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    </Card>
  )
}
