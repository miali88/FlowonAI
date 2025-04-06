import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 w-[100px] flex justify-center items-center text-yellow-800 hover:bg-yellow-100/80 px-4 py-1 rounded-md";
      case "in progress":
        return "bg-blue-100 w-[100px] flex justify-center items-center text-blue-800 hover:bg-blue-100/80 px-4 py-1 rounded-md";
      case "called":
        return "bg-green-100 w-[100px] flex justify-center items-center text-green-800 hover:bg-green-100/80 px-4 py-1 rounded-md";
      default:
        return "bg-gray-100 w-[100px] flex justify-center items-center text-gray-800 hover:bg-gray-100/80 px-4 py-1 rounded-md";
    }
  };

  return (
    <Badge className={getStatusStyle(status)}>
      {status}
    </Badge>
  );
} 