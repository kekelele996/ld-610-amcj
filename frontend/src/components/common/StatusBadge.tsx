import { PlanApprovalStatusText } from "../../constants/PlanApprovalStatus";
import { StepStatusText } from "../../constants/StepStatus";

const STATUS_CLASS: Record<string, string> = {
  DRAFT: "badge-draft",
  SUBMITTED: "badge-submitted",
  APPROVED: "badge-approved",
  REJECTED: "badge-rejected",
  ARCHIVED: "badge-archived",
  PENDING: "badge-pending",
  IN_PROGRESS: "badge-progress",
  COMPLETED: "badge-completed"
};

const TEXT: Record<string, string> = { ...PlanApprovalStatusText, ...StepStatusText };

/** 方案审批状态 / 步骤执行状态统一徽标，文案来自枚举常量 */
export function StatusBadge({ value, title }: { value: string; title?: string }) {
  const className = STATUS_CLASS[value] ?? "badge-draft";
  return (
    <span className={`badge ${className}`} title={title}>
      {TEXT[value] ?? value.replace(/_/g, " ")}
    </span>
  );
}
