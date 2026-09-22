import type { PlanProgress } from "../../types/RestorationPlan";
import { formatProgress } from "../../utils/formatters";

// 档案中的修复进度展示：进度条 + 计数
export function ProgressBar({ progress }: { progress?: PlanProgress }) {
  const safe: PlanProgress = progress ?? { total: 0, pending: 0, in_progress: 0, finished: 0, percent: 0, all_finished: false };
  return (
    <div className="progress" title={`待执行 ${safe.pending} · 执行中 ${safe.in_progress} · 已完成 ${safe.finished}`}>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${safe.percent}%` }} />
      </div>
      <span className="progress-text">{formatProgress(safe)}</span>
    </div>
  );
}
