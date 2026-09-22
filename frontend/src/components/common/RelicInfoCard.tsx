import type { RelicArchive } from "../../types/RelicArchive";
import { RelicConditionText } from "../../constants/RelicCondition";
import { StatusBadge } from "./StatusBadge";

interface RelicInfoCardProps {
  relic: RelicArchive;
  onOpen?: (id: number) => void;
}

/** 文物档案卡：基本信息 + 关联方案数 + 修复总进度 */
export function RelicInfoCard({ relic, onOpen }: RelicInfoCardProps) {
  return (
    <article className="relic-card panel">
      <div className="relic-card-head">
        <div>
          <span className="relic-code">{relic.relic_code}</span>
          <h3>{relic.name}</h3>
          <p className="relic-sub">
            {relic.era} · {relic.material} · {relic.collection_level}
          </p>
        </div>
        <StatusBadge value={relic.current_condition} title={RelicConditionText[relic.current_condition as keyof typeof RelicConditionText] ?? relic.current_condition} />
      </div>
      <div className="progress-track" aria-label="修复总进度">
        <div className="progress-fill" style={{ width: `${relic.overall_percent}%` }} />
        <span className="progress-label">{relic.overall_percent}%</span>
      </div>
      <p className="relic-meta">
        方案 {relic.plan_count} 个 · 影像 {relic.image_count} 个 · 库位 {relic.storage_location}
      </p>
      {onOpen && (
        <button className="btn btn-small" onClick={() => onOpen(relic.id)}>
          查看档案进度
        </button>
      )}
    </article>
  );
}
