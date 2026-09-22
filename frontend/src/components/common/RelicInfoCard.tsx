import type { RelicItem } from "../../types/RelicItem";
import { StatusBadge } from "./StatusBadge";

// 藏品信息卡片：文物档案页与详情弹层共用
export function RelicInfoCard({ relic }: { relic: RelicItem }) {
  return (
    <div className="relic-info-card">
      <div className="relic-info-head">
        <div>
          <h2>{relic.name}</h2>
          <p className="row-sub">{relic.relic_code} · {relic.era} · {relic.material}</p>
        </div>
        <StatusBadge value={relic.current_condition} text={relic.current_condition.replace(/_/g, " ")} tone="warning" />
      </div>
      <dl className="relic-info-grid">
        <div><dt>藏品级别</dt><dd>{relic.collection_level}</dd></div>
        <div><dt>存放位置</dt><dd>{relic.storage_location}</dd></div>
      </dl>
    </div>
  );
}
