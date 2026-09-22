import { useEffect } from "react";
import { useRestorationPlanStore } from "../stores/RestorationPlanStore";
import { useRelicArchiveStore } from "../stores/RelicArchiveStore";
import { StatCard } from "../components/common/StatCard";
import { StatusBadge } from "../components/common/StatusBadge";
import { ProgressBar } from "../components/common/ProgressBar";

export function DashboardPage({ onGoPlans }: { onGoPlans: () => void }) {
  const planStore = useRestorationPlanStore();
  const archiveStore = useRelicArchiveStore();

  useEffect(() => {
    void planStore.load();
    void archiveStore.load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const plans = planStore.rows;
  const pending = plans.filter((plan) => plan.approval_status === "SUBMITTED").length;
  const rejected = plans.filter((plan) => plan.approval_status === "REJECTED").length;
  const frozen = plans.filter((plan) => plan.progress.executionFrozen && plan.progress.total > 0).length;
  const archived = plans.filter((plan) => plan.approval_status === "ARCHIVED").length;

  return (
    <section className="dashboard">
      <section className="metrics">
        <StatCard label="待专家审批方案" value={pending} />
        <StatCard label="已退回待修订" value={rejected} />
        <StatCard label="步骤被冻结方案" value={frozen} />
        <StatCard label="已归档方案" value={archived} />
      </section>

      <div className="panel wide">
        <div className="panel-head">
          <h2>方案审批与执行进度</h2>
          <button className="btn btn-small" onClick={onGoPlans}>
            进入方案审批页
          </button>
        </div>
        {planStore.loading ? (
          <p className="loading-hint">加载中…</p>
        ) : (
          <div className="table">
            {plans.map((plan) => (
              <article key={plan.id} className="row dashboard-row" onClick={onGoPlans}>
                <div>
                  <strong>
                    #{plan.id} {plan.plan_title}
                  </strong>
                  <p className="plan-row-sub">
                    {plan.owner_name ?? `修复师#${plan.owner_id}`} · v{plan.approval_version}
                  </p>
                </div>
                <StatusBadge value={plan.approval_status} />
                <ProgressBar
                  percent={plan.progress.percent}
                  completed={plan.progress.completed}
                  total={plan.progress.total}
                  frozen={plan.progress.executionFrozen}
                />
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="panel">
        <h2>档案修复总览</h2>
        {archiveStore.rows.map((relic) => (
          <div key={relic.id} className="row">
            <strong>{relic.name}</strong>
            <span>{relic.overall_percent}%</span>
            <StatusBadge value={relic.current_condition} />
          </div>
        ))}
      </div>
    </section>
  );
}
