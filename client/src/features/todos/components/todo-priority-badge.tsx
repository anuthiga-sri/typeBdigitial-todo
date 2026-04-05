import type { TodoPriority } from "@typebdigital/shared";
import { Badge } from "@/shared/components/ui/badge";

const variantByPriority: Record<
  TodoPriority,
  "low" | "medium" | "high" | "urgent"
> = {
  low: "low",
  medium: "medium",
  high: "high",
  urgent: "urgent",
};

export function TodoPriorityBadge({ priority }: { priority: TodoPriority }) {
  return (
    <Badge variant={variantByPriority[priority]} className="capitalize">
      {priority}
    </Badge>
  );
}
