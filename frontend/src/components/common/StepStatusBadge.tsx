import { StatusBadge } from "./StatusBadge";
import type { StepExecutionStatus } from "../../constants/StepExecutionStatus";
import { formatStepStatus } from "../../utils/formatters";

const toneMap: Record<StepExecutionStatus, "default" | "muted" | "warning" | "success"> = {
  PENDING: "muted",
  IN_PROGRESS: "warning",
  FINISHED: "success"
};

export function StepStatusBadge({ status }: { status: string }) {
  return (
    <StatusBadge
      value={status}
      text={formatStepStatus(status)}
      tone={toneMap[status as StepExecutionStatus] ?? "default"}
    />
  );
}
