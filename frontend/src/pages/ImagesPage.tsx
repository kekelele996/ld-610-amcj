import { useEffect } from "react";
import { useImageVersionStore } from "../stores/ImageVersionStore";
import { ImageCompare } from "../components/common/ImageCompare";
import { EmptyState } from "../components/common/EmptyState";
import { formatDate } from "../utils/formatters";

const IMAGE_TYPE_TEXT: Record<string, string> = {
  BEFORE: "修复前",
  EVIDENCE: "过程影像",
  AFTER: "修复后"
};

export function ImagesPage() {
  const { rows, loading, error, load } = useImageVersionStore();
  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="panel wide">
      <h2>影像版本</h2>
      {loading ? (
        <p className="loading-hint">加载中…</p>
      ) : error ? (
        <div className="alert alert-error">⚠ {error}</div>
      ) : rows.length === 0 ? (
        <EmptyState title="暂无影像版本" />
      ) : (
        <div className="image-grid">
          {rows.map((row) => (
            <ImageCompare
              key={row.id}
              title={`${row.version_no} · ${IMAGE_TYPE_TEXT[row.image_type] ?? row.image_type}`}
              subtitle={`文物 #${row.relic_id} · 方案 #${row.plan_id} · ${formatDate(row.capture_at)}`}
              note={row.note}
              filePath={row.file_path}
            />
          ))}
        </div>
      )}
    </section>
  );
}
