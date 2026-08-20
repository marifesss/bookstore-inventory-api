interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  isFetching: boolean;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  total,
  isFetching,
  onPageChange,
}: PaginationProps) {
  const button =
    'h-10 rounded-card border border-line bg-surface px-4 font-medium text-ink ' +
    'transition-colors hover:bg-paper disabled:cursor-not-allowed disabled:text-muted disabled:hover:bg-surface';

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-xs text-muted">
        <span className="font-mono">{total}</span>{' '}
        {total === 1 ? 'libro' : 'libros'} en el inventario
        {isFetching && <span className="ml-2">actualizando…</span>}
      </p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className={button}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Anterior
        </button>

        <span className="text-xs text-muted">
          Página <span className="font-mono text-ink">{page}</span> de{' '}
          <span className="font-mono text-ink">{Math.max(totalPages, 1)}</span>
        </span>

        <button
          type="button"
          className={button}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
