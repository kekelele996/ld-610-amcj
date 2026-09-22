import { useEffect, useMemo, useState } from "react";
import { useRestorationPlanStore } from "../stores/RestorationPlanStore";
import { useAuthStore } from "../stores/AuthStore";
import { PlanDetailPanel } from "../components/PlanDetailPanel";
import { StatusBadge } from "../components/common/StatusBadge";
import { ProgressBar } from "../components/common/ProgressBar";
import { EmptyState } from "../components/common/EmptyState";
import { usePagination } from "../hooks/usePagination";
import type { RestorationPlanDetail } from "../types/RestorationPlan";
import type { PlanApprovalStatus } from "../constants/PlanApprovalStatus";

const FILTERS: { value: PlanApprovalStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "全部" },
  { value: "DRAFT", label: "草稿" },
  { value: "SUBMITTED", label: "待审批" },
  { value: "APPROVED", label: "已通过" },
  { value: "REJECTED", label: "已退回" },
  { value: "ARCHIVED", label: "已归档" }
];

export function PlansPage() {
  const user = useAuthStore((state) => state.user);
  const { rows, loading, error, load } = useRestorationPlanStore();
  const [filter, setFilter] = useState<PlanApprovalStatus | "ALL">("ALL");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(
    () => (filter === "ALL" ? rows : rows.filter((row) => row.approval_status === filter)),
    [rows, filter]
  );
  const { pageRows, page, setPage, totalPages } = usePagination(filtered, 6);

  const selected = rows.find((row) => row.id === selectedId) ?? null;

  if (!user) return null;

  return (
    <section className="plans-page">
      <div className="list-panel panel">
        <div className="panel-head">
          <h2>修复方案审批链</h2>
          <div className="filter-row">
            {FILTERS.map((item) => (
              <button
                key={item.value}
                className={`chip ${filter === item.value ? "chip-active" : ""}`}
                onClick={() => {
                  setFilter(item.value);
                  setPage(1);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        {error && <div className="alert alert-error">⚠ {error}</div>}
        {loading ? (
          <p className="loading-hint">加载中…</p>
        ) : pageRows.length === 0 ? (
          <EmptyState title="当前筛选下没有方案" />
        ) : (
          <div className="plan-list">
            {pageRows.map((plan: RestorationPlanDetail) => (
              <button
                key={plan.id}
                className={`plan-row ${selectedId === plan.id ? "plan-row-active" : ""}`}
                onClick={() => setSelectedId(plan.id)}
              >
                <div className="plan-row-main">
                  <strong>
                    #{plan.id} {plan.plan_title}
                  </strong>
                  <span className="plan-row-sub">
                    {plan.owner_name ?? `修复师#${plan.owner_id}`} · v{plan.approval_version}
                  </span>
                  {plan.approval_status === "REJECTED" && plan.reject_reason && (
                    <span className="reject-clip">退回：{plan.reject_reason}</span>
                  )}
                </div>
                <div className="plan-row-side">
                  <StatusBadge value={plan.approval_status} />
                  <ProgressBar
                    percent={plan.progress.percent}
                    completed={plan.progress.completed}
                    total={plan.progress.total}
                    frozen={plan.progress.executionFrozen}
                  />
                </div>
              </button>
            ))}
          </div>
        )}
        {totalPages > 1 && (
          <div className="pager">
            <button className="btn btn-small" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              上一页
            </button>
            <span>
              {page} / {totalPages}
            </span>
            <button className="btn btn-small" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              下一页
            </button>
          </div>
        )}
      </div>
      {selected ? (
        <PlanDetailPanel plan={selected} user={user} />
      ) : (
        <div className="panel select-hint">
          <EmptyState title="请选择左侧方案查看审批与步骤执行" />
        </div>
      )}
    </section>
  );
}
