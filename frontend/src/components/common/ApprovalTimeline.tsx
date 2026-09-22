import type { ApprovalRecord } from "../../types/RestorationPlan";
import { ApprovalActionText } from "../../constants/ApprovalAction";
import { StatusBadge } from "./StatusBadge";
import { formatDate } from "../../utils/formatters";

/**
 * 审批时间线：完整可追溯链（提交 / 通过 / 退回原因 / 重新送审 / 归档）。
 * 退回记录高亮展示退回原因；重新送审带版本号，说明通过后按原步骤继续。
 */
export function ApprovalTimeline({ records }: { records: ApprovalRecord[] }) {
  if (records.length === 0) {
    return <div className="timeline-empty">暂无审批记录，方案需先由修复师提交审批。</div>;
  }
  return (
    <ol className="timeline">
      {records.map((record) => (
        <li key={record.id} className={`timeline-item timeline-${record.action.toLowerCase()}`}>
          <div className="timeline-dot" />
          <div className="timeline-body">
            <div className="timeline-head">
              <strong>{ApprovalActionText[record.action]}</strong>
              <StatusBadge value={record.to_status} />
              <span className="timeline-version">v{record.approval_version}</span>
              <span className="timeline-meta">
                {record.actor_name} · {formatDate(record.created_at)}
              </span>
            </div>
            {record.comment && <p className="timeline-comment">{record.comment}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
