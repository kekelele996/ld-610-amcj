import { useEffect } from "react";
import { useDamageRecordStore } from "../stores/DamageRecordStore";
import { useRelicItemStore } from "../stores/RelicItemStore";
import { SeverityBadge } from "../components/common/SeverityBadge";
import { StatusBadge } from "../components/common/StatusBadge";
import { EmptyState } from "../components/common/EmptyState";
import { formatDate } from "../utils/formatters";

export function DamagesPage() {
  const damageStore = useDamageRecordStore();
  const relicStore = useRelicItemStore();

  useEffect(() => {
    void damageStore.load();
    void relicStore.load();
  }, []);

  const relicName = (id: number) => relicStore.rows.find((row) => row.id === id)?.name ?? `文物#${id}`;

  return (
    <section>
      <div className="page-head">
        <div>
          <p className="eyebrow">relic-restore</p>
          <h1>病害记录</h1>
        </div>
      </div>
      <div className="panel wide">
        {damageStore.rows.length === 0 && <EmptyState title="暂无病害记录" />}
        <div className="table">
          {damageStore.rows.map((row) => (
            <article key={row.id} className="row">
              <div>
                <strong>{relicName(row.relic_id)} · {row.position_desc}</strong>
                <span className="row-sub">发现人：{row.discovered_by} · {formatDate(row.discovered_at)}</span>
              </div>
              <SeverityBadge value={row.severity} />
              <StatusBadge value={row.status} text={row.status.replace(/_/g, " ")} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
