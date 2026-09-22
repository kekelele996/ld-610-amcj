import { useEffect, useMemo, useState } from "react";
import { useRestorationPlanStore } from "../stores/RestorationPlanStore";
import { useRestorationStepStore } from "../stores/RestorationStepStore";
import { useAuthStore } from "../stores/AuthStore";
import { usePlanApproval } from "../hooks/usePlanApproval";
import { useStepExecution } from "../hooks/useStepExecution";
import { PlanStatusBadge } from "../components/common/PlanStatusBadge";
import { ApprovalTimeline } from "../components/common/ApprovalTimeline";
import { RejectionNotice } from "../components/common/RejectionNotice";
import { StepList } from "../components/common/StepList";
import { ProgressBar } from "../components/common/ProgressBar";
import { EmptyState } from "../components/common/EmptyState";
import { PlanApprovalStatus, PlanApprovalStatusText, PlanApprovalStatusHint } from "../constants/PlanApprovalStatus";
import type { PlanApprovalStatus as Status } from "../constants/PlanApprovalStatus";
import { summarizeSteps, formatDate } from "../utils/formatters";
import type { RestorationPlan } from "../types/RestorationPlan";
import type { RestorationStep } from "../types/RestorationStep";

function FailureBanner({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="failure-banner" role="alert">
      <span>操作失败：{message}</span>
      <button className="btn btn-link" onClick={onClose}>知道了</button>
    </div>
  );
}

function PlanDetail({
  plan,
  onChanged
}: {
  plan: RestorationPlan;
  onChanged: () => void;
}) {
  const role = useAuthStore((state) => state.user?.role);
  const planStore = useRestorationPlanStore();
  const stepStore = useRestorationStepStore();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [technique, setTechnique] = useState("");
  const [material, setMaterial] = useState("");
  const [localFailure, setLocalFailure] = useState<string | null>(null);

  const approval = usePlanApproval(plan, planStore.approve, {
    onApproved: onChanged,
    onRejected: onChanged
  });

  const steps: RestorationStep[] = useMemo(
    () => stepStore.rows.filter((row) => row.plan_id === plan.id).sort((a, b) => a.step_order - b.step_order),
    [stepStore.rows, plan.id]
  );
  const progress = plan.progress ?? summarizeSteps(steps);

  const nextOrder = useMemo(() => {
    if (plan.approval_status !== "APPROVED") return null;
    const next = steps.find((step) => step.step_status !== "FINISHED");
    return next ? next.step_order : null;
  }, [steps, plan.approval_status]);

  const execution = useStepExecution({
    start: stepStore.start,
    finish: stepStore.finish,
    register: stepStore.register
  });

  useEffect(() => {
    setRejectOpen(false);
    setRegisterOpen(false);
    setLocalFailure(null);
  }, [plan.id]);

  useEffect(() => {
    const message = approval.failure?.message ?? execution.failure?.message ?? null;
    setLocalFailure(message);
  }, [approval.failure, execution.failure]);

  const handleReject = async () => {
    const reason = rejectReason.trim();
    if (!reason) {
      setLocalFailure("退回方案必须填写退回原因");
      return;
    }
    const result = await approval.reject(reason);
    if (result) {
      setRejectReason("");
      setRejectOpen(false);
      onChanged();
    }
  };

  const handleRegister = async () => {
    if (!technique.trim()) {
      setLocalFailure("登记步骤必须填写修复工艺");
      return;
    }
    const result = await execution.registerStep({ plan_id: plan.id, technique: technique.trim(), material_used: material.trim() });
    if (result) {
      setTechnique("");
      setMaterial("");
      setRegisterOpen(false);
    }
  };

  const refreshAfter = async (task: Promise<RestorationStep | import("../api/client").ApiError | null>) => {
    const result = await task;
    if (result && "id" in result) onChanged();
  };

  return (
    <article className="plan-detail panel">
      <div className="plan-detail-head">
        <div>
          <h3>{plan.plan_title}</h3>
          <p className="plan-sub">方案 #{plan.id} · 编制人：{plan.owner_name} · 更新于 {formatDate(plan.updated_at)}</p>
        </div>
        <PlanStatusBadge status={plan.approval_status} />
      </div>

      {localFailure && <FailureBanner message={localFailure} onClose={() => { approval.clearFailure(); execution.clearFailure(); }} />}

      <p className="plan-hint">{PlanApprovalStatusHint[plan.approval_status as Status]}</p>

      {plan.approval_status === "REJECTED" && (
        <RejectionNotice reason={plan.rejection_reason} rejectedAt={plan.rejected_at} />
      )}

      <section className="plan-section">
        <h4>方案内容</h4>
        <div className="plan-grid">
          <div><span>修复方法</span><p>{plan.method || "—"}</p></div>
          <div><span>风险评估</span><p>{plan.risk_assessment || "—"}</p></div>
          <div><span>送审时间</span><p>{formatDate(plan.submitted_at)}</p></div>
          <div><span>通过时间</span><p>{formatDate(plan.approved_at)}</p></div>
        </div>
      </section>

      <section className="plan-section">
        <div className="section-title-row">
          <h4>修复进度（档案展示）</h4>
          <ProgressBar progress={progress} />
        </div>
        <StepList
          plan={plan}
          steps={steps}
          role={role}
          nextOrder={nextOrder}
          acting={execution.acting}
          onStart={(step) => { void refreshAfter(execution.startStep(step.id)); }}
          onFinish={(step) => { void refreshAfter(execution.finishStep(step.id)); }}
        />
        {role === "RESTORER" && plan.approval_status === "APPROVED" && (
          <div className="step-register">
            {!registerOpen ? (
              <button className="btn btn-primary" onClick={() => setRegisterOpen(true)}>登记下一步骤</button>
            ) : (
              <div className="inline-form">
                <input placeholder="修复工艺（必填）" value={technique} onChange={(e) => setTechnique(e.target.value)} />
                <input placeholder="使用材料" value={material} onChange={(e) => setMaterial(e.target.value)} />
                <button className="btn btn-primary" disabled={execution.acting} onClick={handleRegister}>确认登记</button>
                <button className="btn btn-ghost" onClick={() => setRegisterOpen(false)}>取消</button>
              </div>
            )}
          </div>
        )}
        {role === "RESTORER" && plan.approval_status !== "APPROVED" && (
          <p className="gate-hint">
            {plan.approval_status === "REJECTED"
              ? "方案退回待审：步骤保留但禁止继续执行，请重新送审。"
              : "方案未经专家审批通过，禁止登记或执行步骤。"}
          </p>
        )}
      </section>

      <section className="plan-section">
        <h4>审批与执行链</h4>
        <ApprovalTimeline records={plan.approval_records} />
      </section>

      <section className="plan-section approval-actions">
        {approval.canSubmit && (
          <button className="btn btn-primary" disabled={approval.submitting} onClick={() => approval.submit(plan.approval_status === "REJECTED" ? "已按退回原因整改，重新送审" : "方案送审")}>
            {plan.approval_status === "REJECTED" ? "重新送审" : "提交审批"}
          </button>
        )}
        {approval.canApprove && (
          <button className="btn btn-success" disabled={approval.submitting} onClick={() => approval.approve("同意实施")}>
            审批通过
          </button>
        )}
        {approval.canReject && !rejectOpen && (
          <button className="btn btn-danger" disabled={approval.submitting} onClick={() => setRejectOpen(true)}>
            退回待审
          </button>
        )}
        {approval.canReject && rejectOpen && (
          <div className="inline-form reject-form">
            <textarea
              placeholder="必须填写退回原因（将写入审批链并通知修复师）"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={2}
            />
            <button className="btn btn-danger" disabled={approval.submitting} onClick={handleReject}>确认退回</button>
            <button className="btn btn-ghost" onClick={() => setRejectOpen(false)}>取消</button>
          </div>
        )}
        {approval.canArchive && (
          <button className="btn btn-primary" disabled={approval.submitting} onClick={() => approval.archive("修复完成，归档入库")}>
            归档
          </button>
        )}
        {role && !approval.canSubmit && !approval.canApprove && !approval.canReject && !approval.canArchive && (
          <p className="gate-hint">当前角色「{role}」在状态「{PlanApprovalStatusText[plan.approval_status as Status]}」下无可用审批动作（后端将拒绝任何越权请求）。</p>
        )}
      </section>
    </article>
  );
}

export function PlansPage() {
  const { rows, loading, load } = useRestorationPlanStore();
  const stepStore = useRestorationStepStore();
  const role = useAuthStore((state) => state.user?.role);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"ALL" | Status>("ALL");

  useEffect(() => {
    load();
    stepStore.load();
  }, [load, stepStore]);

  // 工作台点击方案后跳转并选中
  useEffect(() => {
    const handler = (event: Event) => {
      const id = (event as CustomEvent<{ id: number }>).detail?.id;
      if (id) setSelectedId(id);
    };
    window.addEventListener("relic:open-plan", handler);
    return () => window.removeEventListener("relic:open-plan", handler);
  }, []);

  const filtered = useMemo(
    () => (filter === "ALL" ? rows : rows.filter((row) => row.approval_status === filter)),
    [rows, filter]
  );
  const selected =
    rows.find((row) => row.id === selectedId) ??
    filtered.find((row) => row.id === selectedId) ??
    filtered[0] ??
    null;

  const reloadAll = () => {
    load();
    stepStore.load();
  };

  return (
    <section className="plans-page">
      <div className="page-head">
        <div>
          <p className="eyebrow">relic-restore</p>
          <h1>修复方案</h1>
          <p className="page-desc">专家通过后修复师才能登记步骤；方案退回待审时既有步骤保留但禁止继续执行，重新通过后按原步骤继续。</p>
        </div>
      </div>

      <div className="plans-layout">
        <aside className="plan-list panel">
          <div className="filter-row">
            <label>状态筛选</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value as "ALL" | Status)}>
              <option value="ALL">全部</option>
              {PlanApprovalStatus.map((value) => (
                <option key={value} value={value}>{PlanApprovalStatusText[value]}</option>
              ))}
            </select>
          </div>
          {loading && <p>加载中…</p>}
          {!loading && filtered.length === 0 && <EmptyState title="暂无符合条件的方案" />}
          {filtered.map((plan) => (
            <button
              key={plan.id}
              className={`plan-list-item ${selected?.id === plan.id ? "active" : ""}`}
              onClick={() => setSelectedId(plan.id)}
            >
              <div className="plan-list-main">
                <strong>{plan.plan_title}</strong>
                <span>#{plan.id} · {plan.owner_name}</span>
              </div>
              <PlanStatusBadge status={plan.approval_status} />
            </button>
          ))}
        </aside>
        <div className="plan-detail-wrap">
          {selected ? <PlanDetail plan={selected} onChanged={reloadAll} /> : <EmptyState title="请选择左侧方案" />}
        </div>
      </div>
    </section>
  );
}
