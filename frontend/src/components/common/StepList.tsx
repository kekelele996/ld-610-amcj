import type { RestorationStep } from "../../types/RestorationStep";
import { StepStatusText } from "../../constants/StepStatus";
import { StatusBadge } from "./StatusBadge";
import { formatDate } from "../../utils/formatters";

interface StepListProps {
  steps: RestorationStep[];
  /** 方案是否处于已通过状态：退回/待审时步骤只读并显示冻结原因 */
  frozen: boolean;
  frozenReason?: string;
  canRun?: boolean;
  acting?: boolean;
  onStart?: (step: RestorationStep) => void;
  onComplete?: (step: RestorationStep) => void;
}

/** 步骤执行列表：严格按 step_order 展示；退回期间既有步骤保留但禁用全部执行按钮 */
export function StepList({ steps, frozen, frozenReason, canRun, acting, onStart, onComplete }: StepListProps) {
  if (steps.length === 0) {
    return (
      <div className="empty">
        {frozen ? "方案重新通过后即可在此登记步骤。" : "尚无修复步骤，方案通过后由修复师登记。"}
      </div>
    );
  }
  return (
    <div className="step-list">
      {frozen && <div className="freeze-banner">⛔ {frozenReason ?? "方案未处于已通过状态，步骤执行已冻结；既有步骤均已保留。"}</div>}
      {steps.map((step, index) => {
        const previousDone = index === 0 || steps[index - 1].step_status === "COMPLETED";
        const startDisabled = frozen || !canRun || step.step_status !== "PENDING" || !previousDone;
        const completeDisabled = frozen || !canRun || step.step_status !== "IN_PROGRESS";
        return (
          <article key={step.id} className={`step-item step-${step.step_status.toLowerCase()}`}>
            <div className="step-order">第 {step.step_order} 步</div>
            <div className="step-main">
              <div className="step-head">
                <strong>{step.technique}</strong>
                <StatusBadge value={step.step_status} title={StepStatusText[step.step_status]} />
              </div>
              <p className="step-material">材料：{step.material_used || "待登记"}</p>
              <p className="step-time">
                登记 {formatDate(step.registered_at)} · 开始 {formatDate(step.started_at)} · 完成{" "}
                {formatDate(step.finished_at)}
              </p>
              {step.step_status === "PENDING" && !previousDone && (
                <p className="step-blocked">前序步骤未完成，本步骤按规定不能开始。</p>
              )}
            </div>
            <div className="step-actions">
              {step.step_status === "PENDING" && (
                <button className="btn btn-small" disabled={startDisabled || acting} onClick={() => onStart?.(step)}>
                  开始执行
                </button>
              )}
              {step.step_status === "IN_PROGRESS" && (
                <button className="btn btn-small btn-primary" disabled={completeDisabled || acting} onClick={() => onComplete?.(step)}>
                  办结
                </button>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
