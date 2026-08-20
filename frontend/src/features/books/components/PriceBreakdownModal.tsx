import type { ReactNode } from 'react';

import { Modal } from '../../../components/ui/Modal';
import type { ApiError } from '../../../api/client';
import { formatAmount } from '../../../lib/formatters';
import type { Book, PriceBreakdown } from '../../../types/book';

interface PriceBreakdownModalProps {
  book: Book;
  breakdown: PriceBreakdown | undefined;
  isPending: boolean;
  error: ApiError | null;
  onClose: () => void;
}

function Line({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1">
      <span className="text-muted">{label}</span>
      <span className="text-right text-ink">
        {value}
        {note}
      </span>
    </div>
  );
}

export function PriceBreakdownModal({
  book,
  breakdown,
  isPending,
  error,
  onClose,
}: PriceBreakdownModalProps) {
  return (
    <Modal title="Precio de venta sugerido" onClose={onClose}>
      <p className="mb-4 text-muted">{book.title}</p>

      {isPending && (
        <p className="py-8 text-center text-muted">Consultando la tasa de cambio…</p>
      )}

      {error !== null && (
        <div className="rounded-card border border-danger bg-danger-tint p-4 text-danger">
          {error.message}
        </div>
      )}

      {breakdown !== undefined && (
        <div className="rounded-card bg-forest-tint p-5 font-mono">
          <Line
            label="Costo original"
            value={`USD ${formatAmount(breakdown.cost_usd)}`}
          />
          <Line
            label="Tasa de cambio"
            value={String(breakdown.exchange_rate)}
            note={
              breakdown.rate_source === 'api' ? (
                <span className="ml-3 text-xs text-muted">· API en vivo</span>
              ) : (
                <span className="ml-3 text-xs text-amber">· tasa por defecto</span>
              )
            }
          />

          <hr className="my-3 border-line" />

          <Line
            label="Costo local"
            value={`${breakdown.currency} ${formatAmount(breakdown.cost_local)}`}
          />
          <Line label="Margen aplicado" value={`${breakdown.margin_percentage}%`} />

          <div className="my-3 border-t-4 border-double border-forest/40" />

          <div className="flex items-baseline justify-between gap-4">
            <span className="text-muted">Precio de venta</span>
            <span className="text-[24px] font-medium text-forest">
              {breakdown.currency} {formatAmount(breakdown.selling_price_local)}
            </span>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="h-10 rounded-card border border-line bg-surface px-4 font-medium text-ink transition-colors hover:bg-paper"
        >
          Cerrar
        </button>
      </div>
    </Modal>
  );
}
