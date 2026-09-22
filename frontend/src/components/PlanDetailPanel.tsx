import { useState } from "react";
import type { RestorationPlanDetail } from "../types/RestorationPlan";
import type { RestorationStep } from "../types/RestorationStep";
import type { AuthUser } from "../types/Auth";
import { usePlanApproval } from "../hooks/usePlanApproval";
import { useRestorationPlanStore } from "../stores/RestorationPlanStore";
import { ApprovalTimeline } from "../components/common/ApprovalTimeline";
import { StepList } from "../components/common/StepList";
import { ProgressBar } from "../components/common/ProgressBar";
import { StatusBadge } from "../components/common/StatusBadge";
import { PlanApprovalStatusText } from "../constants/PlanApprovalStatus";
import { formatDate } from "../utils/formatters";

interface Props {
  plan: RestorationPlanDetail;
  user: AuthUser;
}

/** 方案详情：审批操作 + 退回原因 + 步骤执行 + 审批时间线，构成完整追溯链 */
export function PlanDetailPanel({ plan, user }: Props) {
  const store = useRestorationPlanStore();
  const { availability } = usePlanApproval(plan, user.id, user.role);
  const [rejectReason, setRejectReason] = useState(plan.reject_reason ?? "");
  const [comment, setComment] = useState("");
  const [technique, setTechnique] = useState("");
  const [materialUsed, setMaterialUsed] = useState("");

  const frozen = plan.progress.executionFrozen;

  return (
    <section className="plan-detail panel">
      <header className="plan-detail-head">
        <div>
          <h3>{plan.plan_title}</h3>
          <p className="relic-sub">
            方案 #{plan.id} · 编制人 {plan.owner_name ?? plan.owner_id} · 当前版本 v{plan.approval_version}
          </p>
        </div>
        <StatusBadge value={plan.approval_status} title={PlanApprovalStatusText[plan.approval_status]} />
      </header>

      {store.error && <div className="alert alert-error">⚠ {store.error}</div>}

      {plan.approval_status === "REJECTED" && plan.reject_reason && (
        <div className="alert alert-reject">
          <strong>退回原因（待修改后重新送审）：</strong>
          <p>{plan.reject_reason}</p>
        </div>
      )}

      <div className="plan-grid">
        <div className="plan-main">
          <div className="field-block">
            <h4>工艺方法</h4>
            <p>{plan.method}</p>
          </div>
          <div className="field-block">
            <h4>风险评估</h4>
            <p>{plan.risk_assessment}</p>
          </div>

          <div className="field-block">
            <div className="block-title-row">
              <h4>修复步骤与执行</h4>
              <ProgressBar
                percent={plan.progress.percent}
                completed={plan.progress.completed}
                total={plan.progress.total}
                frozen={frozen}
              />
            </div>
            <StepList
              steps={plan.steps}
              frozen={frozen}
              canRun={availability.canRunSteps}
              acting={store.acting}
              onStart={(step) => void store.startStep(step.id)}
              onComplete={(step: RestorationStep) =>
                void store.completeStep(step.id, step.material_used)
              }
            />
            {availability.canRegisterStep && (
              <div className="step-register">
                <input
                  placeholder="新工艺名称（如：随色补配）"
                  value={technique}
                  onChange={(e) => setTechnique(e.target.value)}
                />
                <input
                  placeholder="使用材料"
                  value={materialUsed}
                  onChange={(e) => setMaterialUsed(e.target.value)}
                />
                <button
                  className="btn btn-small"
                  disabled={store.acting || !technique.trim()}
                  onClick={async () => {
                    const ok = await store.registerStep(plan.id, technique.trim(), materialUsed.trim());
                    if (ok) {
                      setTechnique("");
                      setMaterialUsed("");
                    }
                  }}
                >
                  登记新步骤
                </button>
              </div>
            )}
            {plan.approval_status !== "APPROVED" && user.role === "RESTORER" && (
              <p className="rule-hint">
                规则：专家通过后才能登记步骤；{plan.approval_status === "REJECTED" ? "方案退回期间既有步骤保留但已冻结，重新通过后按原步骤继续。" : "当前状态下登记请求会被后端拒绝。"}
              </p>
            )}
          </div>
        </div>

        <aside className="plan-side">
          <div className="field-block">
            <h4>审批操作</h4>
            <div className="action-stack">
              {(availability.canSubmit || availability.canResubmit) && (
                <>
                  <textarea
                    placeholder="送审说明（可选）"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={2}
                  />
                    <button
                      className="btn btn-primary"
                      disabled={store.acting}
                      onClick={() => void store.submit(plan.id, comment)}
                    >
                      {availability.canResubmit ? "修改后重新送审" : "提交专家审批"}
                    </button>
                </>
              )}
              {(availability.canApprove || availability.canReject) && (
                <>
                  <textarea
                    placeholder="审批意见"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={2}
                  />
                  <div className="btn-row">
                    <button
                      className="btn btn-success"
                      disabled={store.acting}
                      onClick={() => void store.approve(plan.id, comment)}
                    >
                      通过
                    </button>
                    <button
                      className="btn btn-danger"
                      disabled={store.acting}
                      onClick={() => void store.reject(plan.id, rejectReason || comment)}
                    >
                      退回
                    </button>
                  </div>
                  <input
                    placeholder="退回时必填：退回原因"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </>
              )}
              {availability.canArchive && (
                <button
                  className="btn btn-primary"
                  disabled={store.acting}
                  onClick={() => void store.archive(plan.id)}
                >
                  归档方案
                </button>
              )}
              {!availability.canSubmit &&
                !availability.canResubmit &&
                !availability.canApprove &&
                !availability.canReject &&
                !availability.canArchive &&
                !availability.canRegisterStep && (
                  <p className="rule-hint">当前角色（{user.display_name}）在此状态下没有可执行动作。</p>
                )}
            </div>
            <ul className="status-meta">
              <li>提交时间：{formatDate(plan.submitted_at)}</li>
              <li>通过时间：{formatDate(plan.approved_at)}</li>
              <li>归档时间：{formatDate(plan.archived_at)}</li>
            </ul>
          </div>

          <div className="field-block">
            <h4>审批与执行追溯</h4>
            <ApprovalTimeline records={plan.approval_records} />
          </div>
        </aside>
      </div>
    </section>
  );
}
