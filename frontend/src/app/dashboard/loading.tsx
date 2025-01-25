"use client";

interface LoadingProps {
  isLoading?: boolean;
}

export default function DashboardLoading({ isLoading = true }: LoadingProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 w-full bg-white relative overflow-hidden">
        <div
          className="h-full bg-[#269af2] absolute"
          style={{
            width: "30%",
            animation: "indeterminate 1s infinite linear",
            transformOrigin: "0% 50%",
          }}
        />
      </div>
      <style jsx>{`
        @keyframes indeterminate {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  );
}
