import { PlanApprovalStatusText } from "../constants/PlanApprovalStatus";
import { StepStatusText } from "../constants/StepStatus";
import { ApprovalActionText } from "../constants/ApprovalAction";

export const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleString("zh-CN", { hour12: false }) : "—";

export const formatStatus = (value: string) =>
  PlanApprovalStatusText[value as keyof typeof PlanApprovalStatusText] ??
  StepStatusText[value as keyof typeof StepStatusText] ??
  value.replace(/_/g, " ");

export const formatAction = (value: string) =>
  ApprovalActionText[value as keyof typeof ApprovalActionText] ?? value;

export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);

export const formatRisk = (value: string) =>
  ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);

export const formatPercent = (value: number) => `${value}%`;
