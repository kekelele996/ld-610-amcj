interface StatusBadgeProps {
  value: string;
  // 可选中文文案；缺省直接展示原始状态
  text?: string;
  tone?: "default" | "danger" | "success" | "warning" | "muted";
}

const toneClass: Record<NonNullable<StatusBadgeProps["tone"]>, string> = {
  default: "",
  danger: "badge-danger",
  success: "badge-success",
  warning: "badge-warning",
  muted: "badge-muted"
};

export function StatusBadge({ value, text, tone = "default" }: StatusBadgeProps) {
  const cls = ["badge", String(value).toLowerCase().replace(/_/g, "-"), toneClass[tone]]
    .filter(Boolean)
    .join(" ");
  return <span className={cls}>{text ?? String(value).replace(/_/g, " ")}</span>;
}
