import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface StatusBadgeProps {
  status: "pending" | "generated" | "error";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants = {
    pending: "bg-primary text-primary-foreground",
    generated: "bg-success text-success-foreground",
    error: "bg-destructive text-destructive-foreground"
  };

  return (
    <Badge className={`${variants[status]} ${className}`}>
      {status === "pending" && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}