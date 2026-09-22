import { useEffect, useMemo, useState } from "react";

/** 通用分页 hook：筛选结果变化时自动收敛页码 */
export function usePagination<T>(rows: T[] = [], initialPageSize = 8) {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(initialPageSize);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const safePage = Math.min(page, totalPages);
  const pageRows = useMemo(
    () => rows.slice((safePage - 1) * pageSize, safePage * pageSize),
    [rows, safePage, pageSize]
  );

  return { page: safePage, setPage, pageSize, pageRows, total: rows.length, totalPages };
}
