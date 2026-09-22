import { StatusBadge } from "./StatusBadge";
import { PlanApprovalStatusText, type PlanApprovalStatus } from "../../constants/PlanApprovalStatus";
import { formatPlanStatus } from "../../utils/formatters";

const toneMap: Record<PlanApprovalStatus, "default" | "danger" | "success" | "warning" | "muted"> = {
  DRAFT: "muted",
  SUBMITTED: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  ARCHIVED: "default"
};

export function PlanStatusBadge({ status }: { status: string }) {
  return (
    <StatusBadge
      value={status}
      text={formatPlanStatus(status)}
      tone={toneMap[status as PlanApprovalStatus] ?? "default"}
    />
  );
}

export { PlanApprovalStatusText };
