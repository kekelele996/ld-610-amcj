import type { RestorationPlan } from "../../types/RestorationPlan";
import type { RestorationStep } from "../../types/RestorationStep";
import type { UserRole } from "../../constants/UserRole";
import { StepStatusBadge } from "./StepStatusBadge";
import { formatDate } from "../../utils/formatters";

interface StepListProps {
  plan: RestorationPlan;
  steps: RestorationStep[];
  role?: UserRole;
  // 当前允许执行的步骤序号：方案 APPROVED 时取第一个未完成步骤
  nextOrder?: number | null;
  onStart?: (step: RestorationStep) => void;
  onFinish?: (step: RestorationStep) => void;
  acting?: boolean;
}

// 步骤列表：退回待审时既有步骤只读展示；通过后按顺序执行，按钮显隐受角色与状态双重控制
export function StepList({ plan, steps, role, nextOrder, onStart, onFinish, acting }: StepListProps) {
  const frozen = plan.approval_status === "REJECTED" || plan.approval_status === "ARCHIVED" || plan.approval_status !== "APPROVED";
  const sorted = [...steps].sort((a, b) => a.step_order - b.step_order);

  if (sorted.length === 0) {
    return <p className="timeline-empty">暂无修复步骤{plan.approval_status === "APPROVED" ? "，修复师可登记第一步" : "（方案通过后才能登记）"}</p>;
  }

  return (
    <div className="step-list">
      {frozen && plan.approval_status === "REJECTED" && (
        <p className="step-frozen-hint">方案退回待审期间，以下既有步骤全部冻结，禁止继续执行。</p>
      )}
      {sorted.map((step) => {
        const isNext = !frozen && nextOrder === step.step_order;
        const canOperate = role === "RESTORER" && !frozen;
        return (
          <article key={step.id} className={`step-item step-${step.step_order === nextOrder ? "next" : "locked"}`}>
            <div className="step-index">第 {step.step_order} 步</div>
            <div className="step-main">
              <div className="step-title-row">
                <strong>{step.technique}</strong>
                <StepStatusBadge status={step.step_status} />
                {isNext && <span className="step-next-tag">当前执行</span>}
              </div>
              <p className="step-material">材料：{step.material_used || "—"} · 操作人：{step.operator_name || "—"}</p>
              <p className="step-time">
                开始：{formatDate(step.started_at)} · 完成：{formatDate(step.finished_at)}
                {step.quality_note ? ` · 质检：${step.quality_note}` : ""}
              </p>
            </div>
            <div className="step-actions">
              {canOperate && step.step_status === "PENDING" && (
                <button
                  className="btn btn-primary"
                  disabled={!isNext || acting}
                  title={isNext ? "开始执行本步骤" : "存在前序步骤未完成，必须按原步骤顺序执行"}
                  onClick={() => onStart?.(step)}
                >
                  开始
                </button>
              )}
              {canOperate && step.step_status === "IN_PROGRESS" && (
                <button className="btn btn-success" disabled={acting} onClick={() => onFinish?.(step)}>
                  完成并质检
                </button>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
