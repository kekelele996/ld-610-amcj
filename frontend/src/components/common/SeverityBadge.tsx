import { StatusBadge } from "./StatusBadge";

const SEVERITY_TEXT: Record<string, string> = {
  LOW: "轻度",
  MEDIUM: "中度",
  HIGH: "重度",
  CRITICAL: "危重"
};

const SEVERITY_TONE: Record<string, "muted" | "warning" | "danger" | "default"> = {
  LOW: "muted",
  MEDIUM: "warning",
  HIGH: "danger",
  CRITICAL: "danger"
};

export function SeverityBadge({ value }: { value: string }) {
  return (
    <StatusBadge
      value={value}
      text={SEVERITY_TEXT[value] ?? value}
      tone={SEVERITY_TONE[value] ?? "default"}
    />
  );
}
