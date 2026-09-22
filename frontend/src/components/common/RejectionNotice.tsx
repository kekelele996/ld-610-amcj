import { formatDate } from "../../utils/formatters";

// 退回原因展示块：方案处于“退回待审”时在详情与档案页醒目提示
export function RejectionNotice({ reason, rejectedAt }: { reason: string | null; rejectedAt?: string | null }) {
  if (!reason) return null;
  return (
    <div className="rejection-notice" role="alert">
      <strong>方案已退回待审</strong>
      <p>退回原因：{reason}</p>
      {rejectedAt ? <span className="rejection-time">退回时间：{formatDate(rejectedAt)}</span> : null}
      <p className="rejection-hint">既有步骤已保留但禁止继续执行；请修改方案后重新送审，专家重新通过后可按原步骤继续。</p>
    </div>
  );
}
