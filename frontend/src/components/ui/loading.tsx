import { Loader2 } from "lucide-react";

export function Loading() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="loader"></div>
    </div>
  );
}

export function LoadingWithText({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="loader"></div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

export function LoadingSpinner() {
  return <Loader2 className="h-4 w-4 animate-spin" />;
} 