import { useEffect, useState } from "react";
import { useRelicArchiveStore } from "../stores/RelicArchiveStore";
import { RelicInfoCard } from "../components/common/RelicInfoCard";
import { StatusBadge } from "../components/common/StatusBadge";
import { ProgressBar } from "../components/common/ProgressBar";
import { ApprovalTimeline } from "../components/common/ApprovalTimeline";
import { EmptyState } from "../components/common/EmptyState";
import type { RelicArchive } from "../types/RelicArchive";

/** 文物档案：每件文物下方案的审批状态、退回原因与步骤进度全部可查 */
export function RelicsPage() {
  const { rows, loading, error, load } = useRelicArchiveStore();
  const [activeId, setActiveId] = useState<number | null>(null);

  useEffect(() => {
    void load();
  }, [load]);

  const active: RelicArchive | undefined = rows.find((row) => row.id === activeId);

  return (
    <section className="relics-page">
      <div className="relic-grid">
        {loading ? (
          <p className="loading-hint">档案加载中…</p>
        ) : error ? (
          <div className="alert alert-error">⚠ {error}</div>
        ) : rows.length === 0 ? (
          <EmptyState title="暂无文物档案" />
        ) : (
          rows.map((relic) => (
            <RelicInfoCard
              key={relic.id}
              relic={relic}
              onOpen={(id) => setActiveId((current) => (current === id ? null : id))}
            />
          ))
        )}
      </div>

      {active && (
        <div className="panel archive-detail">
          <header className="plan-detail-head">
            <div>
              <h2>
                {active.name}（{active.relic_code}）修复档案
              </h2>
              <p className="relic-sub">
                {active.era} · {active.material} · 总进度 {active.overall_percent}%
              </p>
            </div>
          </header>
          {active.plans.length === 0 && <EmptyState title="该文物暂无修复方案" />}
          {active.plans.map((plan) => (
            <article key={plan.id} className="archive-plan">
              <div className="archive-plan-head">
                <strong>
                  #{plan.id} {plan.plan_title}
                </strong>
                <StatusBadge value={plan.approval_status} />
                <span className="timeline-version">v{plan.approval_version}</span>
              </div>
              <ProgressBar
                percent={plan.progress.percent}
                completed={plan.progress.completed}
                total={plan.progress.total}
                frozen={plan.progress.executionFrozen}
              />
              {plan.approval_status === "REJECTED" && plan.reject_reason && (
                <p className="reject-line">退回原因：{plan.reject_reason}</p>
              )}
              <details>
                <summary>查看审批与执行时间线（{plan.approval_records.length} 条）</summary>
                <ApprovalTimeline records={plan.approval_records} />
              </details>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
