import type { ApprovalRecord } from "../../types/RestorationPlan";
import { UserRoleText } from "../../constants/UserRole";
import { formatApprovalAction, formatDate } from "../../utils/formatters";

const actionClass: Record<string, string> = {
  SUBMIT: "timeline-submit",
  APPROVE: "timeline-approve",
  REJECT: "timeline-reject",
  ARCHIVE: "timeline-archive"
};

// 审批链时间线：送审 → 通过 / 退回（含退回原因）→ 重新送审 → 归档，全程可追溯
export function ApprovalTimeline({ records }: { records: ApprovalRecord[] }) {
  if (records.length === 0) {
    return <p className="timeline-empty">暂无审批记录（方案尚未送审）</p>;
  }
  return (
    <ol className="timeline">
      {records.map((record) => (
        <li key={record.id} className={`timeline-item ${actionClass[record.action] ?? ""}`}>
          <div className="timeline-dot" />
          <div className="timeline-body">
            <div className="timeline-head">
              <strong>{formatApprovalAction(record.action)}</strong>
              <span className="timeline-meta">
                {record.actor_name}（{UserRoleText[record.actor_role]}）· {formatDate(record.created_at)}
              </span>
            </div>
            {record.comment ? <p className="timeline-comment">{record.comment}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
