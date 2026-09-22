import { useEffect, useMemo, useState } from "react";
import { useRelicItemStore } from "../stores/RelicItemStore";
import { useRestorationPlanStore } from "../stores/RestorationPlanStore";
import { useRestorationStepStore } from "../stores/RestorationStepStore";
import { RelicInfoCard } from "../components/common/RelicInfoCard";
import { PlanStatusBadge } from "../components/common/PlanStatusBadge";
import { ProgressBar } from "../components/common/ProgressBar";
import { RejectionNotice } from "../components/common/RejectionNotice";
import { ApprovalTimeline } from "../components/common/ApprovalTimeline";
import { summarizeSteps, formatDate } from "../utils/formatters";
import type { RelicItem } from "../types/RelicItem";

// 文物档案：藏品信息 + 关联方案的审批状态、退回原因、修复进度与审批链
export function RelicsPage({ onOpenPlan }: { onOpenPlan?: (id: number) => void }) {
  const relicStore = useRelicItemStore();
  const planStore = useRestorationPlanStore();
  const stepStore = useRestorationStepStore();
  const [selectedRelicId, setSelectedRelicId] = useState<number | null>(null);

  useEffect(() => {
    void relicStore.load();
    void planStore.load();
    void stepStore.load();
  }, []);

  const relics = relicStore.rows;
  const selected: RelicItem | null = relics.find((row) => row.id === selectedRelicId) ?? relics[0] ?? null;

  const plansOfRelic = useMemo(
    () => planStore.rows.filter((plan) => plan.relic_id === selected?.id),
    [planStore.rows, selected?.id]
  );

  return (
    <section className="relics-page">
      <div className="page-head">
        <div>
          <p className="eyebrow">relic-restore</p>
          <h1>文物档案</h1>
        </div>
      </div>

      <div className="plans-layout">
        <aside className="plan-list panel">
          {relics.length === 0 && <p className="timeline-empty">暂无藏品</p>}
          {relics.map((relic) => (
            <button
              key={relic.id}
              className={`plan-list-item ${selected?.id === relic.id ? "active" : ""}`}
              onClick={() => setSelectedRelicId(relic.id)}
            >
              <div className="plan-list-main">
                <strong>{relic.name}</strong>
                <span>{relic.relic_code} · {relic.era}</span>
              </div>
            </button>
          ))}
        </aside>

        <div className="plan-detail-wrap">
          {selected && (
            <article className="panel">
              <RelicInfoCard relic={selected} />
              <h3 className="archive-heading">关联修复方案与进度</h3>
              {plansOfRelic.length === 0 && <p className="timeline-empty">暂无修复方案</p>}
              {plansOfRelic.map((plan) => {
                const steps = stepStore.rows.filter((step) => step.plan_id === plan.id);
                const progress = plan.progress ?? summarizeSteps(steps);
                return (
                  <section key={plan.id} className="archive-plan">
                    <div className="archive-plan-head">
                      <div>
                        <strong>{plan.plan_title}</strong>
                        <span className="row-sub">#{plan.id} · 更新于 {formatDate(plan.updated_at)}</span>
                      </div>
                      <PlanStatusBadge status={plan.approval_status} />
                    </div>
                    <ProgressBar progress={progress} />
                    {plan.approval_status === "REJECTED" && (
                      <RejectionNotice reason={plan.rejection_reason} rejectedAt={plan.rejected_at} />
                    )}
                    <details>
                      <summary>查看审批与执行链（{plan.approval_records.length} 条）</summary>
                      <ApprovalTimeline records={plan.approval_records} />
                    </details>
                    <button className="btn btn-link" onClick={() => onOpenPlan?.(plan.id)}>在修复方案页打开 →</button>
                  </section>
                );
              })}
            </article>
          )}
        </div>
      </div>
    </section>
  );
}
