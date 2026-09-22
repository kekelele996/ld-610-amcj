import { StatusBadge } from "./StatusBadge";

// 影像版本对比占位卡片：文物档案页与影像版本页共用
export function ImageCompare({ title, value }: { title: string; value: string }) {
  const text = ({ BEFORE: "修复前", DURING: "修复中", AFTER: "修复后" } as Record<string, string>)[value] ?? value;
  return (
    <div className="image-compare">
      <div className="image-compare-frame">
        <span>影像占位</span>
      </div>
      <div className="image-compare-meta">
        <strong>{title}</strong>
        <StatusBadge value={value} text={text} />
      </div>
    </div>
  );
}
