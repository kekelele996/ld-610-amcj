interface ProgressBarProps {
  percent: number;
  completed: number;
  total: number;
  frozen?: boolean;
}

/** 步骤进度条：档案与方案页共用 */
export function ProgressBar({ percent, completed, total, frozen }: ProgressBarProps) {
  return (
    <div className="progress-wrap">
      <div className={`progress-track ${frozen ? "is-frozen" : ""}`}>
        <div className="progress-fill" style={{ width: `${percent}%` }} />
        <span className="progress-label">{percent}%</span>
      </div>
      <span className="progress-text">
        已完成 {completed}/{total} 步{frozen ? " · 执行冻结" : ""}
      </span>
    </div>
  );
}
