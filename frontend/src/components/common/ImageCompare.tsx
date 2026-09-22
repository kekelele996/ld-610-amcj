interface ImageCompareProps {
  title: string;
  subtitle?: string;
  note?: string;
  filePath?: string;
}

/** 影像版本卡：修复前 / 过程 / 修复后影像统一展示（影像页与文物档案共用） */
export function ImageCompare({ title, subtitle, note, filePath }: ImageCompareProps) {
  return (
    <article className="image-card panel">
      <div className="image-frame" title={filePath}>
        <span className="image-placeholder">影像占位</span>
      </div>
      <h4>{title}</h4>
      {subtitle && <p className="plan-row-sub">{subtitle}</p>}
      {note && <p className="image-note">{note}</p>}
    </article>
  );
}
