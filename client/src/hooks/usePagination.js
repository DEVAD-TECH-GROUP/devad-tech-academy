import { useState } from "react";

export default function usePagination(initial = 1, limit = 10) {
  const [page, setPage] = useState(initial);

  const next = () => setPage((p) => p + 1);
  const prev = () => setPage((p) => Math.max(1, p - 1));
  const goTo = (n) => setPage(n);
  const reset = () => setPage(1);

  return { page, limit, next, prev, goTo, reset };
}
