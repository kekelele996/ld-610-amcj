import { DamageSeverityText } from "../../constants/DamageSeverity";

const SEVERITY_CLASS: Record<string, string> = {
  LOW: "badge-approved",
  MEDIUM: "badge-submitted",
  HIGH: "badge-pending",
  CRITICAL: "badge-rejected"
};

/** 病害严重程度徽标（病害页与工作台共用） */
export function SeverityBadge({ value }: { value: string }) {
  const text = DamageSeverityText[value as keyof typeof DamageSeverityText] ?? value;
  return <span className={`badge ${SEVERITY_CLASS[value] ?? "badge-draft"}`}>{text}</span>;
}
