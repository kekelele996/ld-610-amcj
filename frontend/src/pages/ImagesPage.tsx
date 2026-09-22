import { useEffect } from "react";
import { useImageVersionStore } from "../stores/ImageVersionStore";
import { useRelicItemStore } from "../stores/RelicItemStore";
import { StatusBadge } from "../components/common/StatusBadge";
import { EmptyState } from "../components/common/EmptyState";
import { ImageCompare } from "../components/common/ImageCompare";
import { formatDate } from "../utils/formatters";

export function ImagesPage() {
  const imageStore = useImageVersionStore();
  const relicStore = useRelicItemStore();

  useEffect(() => {
    void imageStore.load();
    void relicStore.load();
  }, []);

  const relicName = (id: number) => relicStore.rows.find((row) => row.id === id)?.name ?? `文物#${id}`;

  return (
    <section>
      <div className="page-head">
        <div>
          <p className="eyebrow">relic-restore</p>
          <h1>影像版本</h1>
        </div>
      </div>
      <div className="panel wide">
        {imageStore.rows.length === 0 && <EmptyState title="暂无影像版本" />}
        <div className="image-grid">
          {imageStore.rows.map((row) => (
            <article key={row.id} className="image-card">
              <ImageCompare title={`${row.version_no} · ${relicName(row.relic_id)}`} value={row.image_type} />
              <p className="row-sub">{row.note}</p>
              <p className="row-sub">{formatDate(row.capture_at)} · 方案 #{row.plan_id}</p>
              <StatusBadge value={row.image_type} text={({ BEFORE: "修复前", DURING: "修复中", AFTER: "修复后" } as Record<string, string>)[row.image_type] ?? row.image_type} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
