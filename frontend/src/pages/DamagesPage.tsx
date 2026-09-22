import { useEffect } from "react";
import { useDamageRecordStore } from "../stores/DamageRecordStore";
import { SeverityBadge } from "../components/common/SeverityBadge";
import { EmptyState } from "../components/common/EmptyState";
import { formatDate } from "../utils/formatters";

export function DamagesPage() {
  const { rows, loading, error, load } = useDamageRecordStore();
  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="panel wide">
      <h2>病害记录</h2>
      {loading ? (
        <p className="loading-hint">加载中…</p>
      ) : error ? (
        <div className="alert alert-error">⚠ {error}</div>
      ) : rows.length === 0 ? (
        <EmptyState title="暂无病害记录" />
      ) : (
        <div className="table">
          {rows.map((row) => (
            <article key={row.id} className="row damage-row">
              <div>
                <strong>{row.damage_type}</strong>
                <p className="plan-row-sub">{row.position_desc}</p>
                <p className="plan-row-sub">
                  {row.discovered_by} · {formatDate(row.discovered_at)}
                </p>
              </div>
              <SeverityBadge value={row.severity} />
              <span className="badge badge-draft">{row.status === "IN_TREATMENT" ? "修复中" : row.status === "CLOSED" ? "已关闭" : "待处理"}</span>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
