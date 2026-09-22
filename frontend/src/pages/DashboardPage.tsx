import { useEffect, useMemo } from "react";
import { useRestorationPlanStore } from "../stores/RestorationPlanStore";
import { StatCard } from "../components/common/StatCard";
import { PlanStatusBadge } from "../components/common/PlanStatusBadge";
import { ProgressBar } from "../components/common/ProgressBar";
import { RejectionNotice } from "../components/common/RejectionNotice";
import { PlanApprovalStatusText } from "../constants/PlanApprovalStatus";
import type { RestorationPlan } from "../types/RestorationPlan";

export function DashboardPage({ onOpenPlan }: { onOpenPlan?: (id: number) => void }) {
  const { rows, load } = useRestorationPlanStore();

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => {
    const submitted = rows.filter((row) => row.approval_status === "SUBMITTED");
    const rejected = rows.filter((row) => row.approval_status === "REJECTED");
    const approved = rows.filter((row) => row.approval_status === "APPROVED");
    const archived = rows.filter((row) => row.approval_status === "ARCHIVED");
    const stepsInProgress = rows.reduce((sum, row) => sum + (row.progress?.in_progress ?? 0), 0);
    return { submitted, rejected, approved, archived, stepsInProgress };
  }, [rows]);

  const focusPlan = (plan: RestorationPlan) => onOpenPlan?.(plan.id);

  return (
    <section className="dashboard-page">
      <div className="page-head">
        <div>
          <p className="eyebrow">relic-restore</p>
          <h1>修复工作台</h1>
        </div>
      </div>

      <section className="metrics">
        <StatCard label="待专家审批方案" value={stats.submitted.length} />
        <StatCard label="退回待审方案" value={stats.rejected.length} />
        <StatCard label="执行中步骤" value={stats.stepsInProgress} />
        <StatCard label="已归档方案" value={stats.archived.length} />
      </section>

      <section className="workbench dashboard-grid">
        <div className="panel wide">
          <h2>待审批 / 退回待审</h2>
          {[...stats.submitted, ...stats.rejected].length === 0 && <p className="timeline-empty">暂无待处理方案</p>}
          <div className="table">
            {[...stats.submitted, ...stats.rejected].map((plan) => (
              <article key={plan.id} className="row plan-row" onClick={() => focusPlan(plan)}>
                <div>
                  <strong>{plan.plan_title}</strong>
                  <span className="row-sub">#{plan.id} · {plan.owner_name} · {PlanApprovalStatusText[plan.approval_status]}</span>
                </div>
                <PlanStatusBadge status={plan.approval_status} />
              </article>
            ))}
          </div>
          {stats.rejected.map((plan) => (
            <RejectionNotice key={`r-${plan.id}`} reason={plan.rejection_reason} rejectedAt={plan.rejected_at} />
          ))}
        </div>

        <div className="panel">
          <h2>实施中方案进度</h2>
          {stats.approved.length === 0 && <p className="timeline-empty">暂无实施中方案</p>}
          <div className="progress-list">
            {stats.approved.map((plan) => (
              <button key={plan.id} className="progress-item" onClick={() => focusPlan(plan)}>
                <div className="progress-item-head">
                  <strong>{plan.plan_title}</strong>
                  <span>#{plan.id}</span>
                </div>
                <ProgressBar progress={plan.progress} />
              </button>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}
