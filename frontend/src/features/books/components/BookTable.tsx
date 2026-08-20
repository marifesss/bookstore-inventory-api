import type { Book } from '../../../types/book';
import { formatAmount } from '../../../lib/formatters';
import { DEFAULT_LOW_STOCK_THRESHOLD, PAGE_SIZE } from '../hooks/useBooks';

interface BookTableProps {
  books: Book[];
  isPending: boolean;
}

/** A number that is compared down a column: mono, right-aligned. */
function Amount({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="text-muted">—</span>;
  }

  return <span className="font-mono">{formatAmount(value)}</span>;
}

function StockCell({ quantity }: { quantity: number }) {
  if (quantity >= DEFAULT_LOW_STOCK_THRESHOLD) {
    return <span className="font-mono">{quantity}</span>;
  }

  return (
    <span className="inline-block rounded-field bg-amber-tint px-2 py-0.5 font-mono text-amber">
      {quantity}
    </span>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: PAGE_SIZE }, (_, row) => (
        <tr key={row} className="h-14 border-b border-line last:border-0">
          <td colSpan={6} className="px-4">
            <div className="h-4 animate-pulse rounded-field bg-paper" />
          </td>
        </tr>
      ))}
    </>
  );
}

export function BookTable({ books, isPending }: BookTableProps) {
  const headerCell = 'px-4 text-xs font-medium uppercase tracking-[0.06em] text-muted';

  return (
    <div className="rounded-card bg-surface shadow-card">
      {/* Table layout from md up */}
      <table className="hidden w-full border-collapse text-left md:table">
        <thead>
          <tr className="h-11 border-b border-line">
            <th className={headerCell}>Libro</th>
            <th className={headerCell}>ISBN</th>
            <th className={headerCell}>Categoría</th>
            <th className={`${headerCell} text-right`}>Stock</th>
            <th className={`${headerCell} text-right`}>Costo USD</th>
            <th className={`${headerCell} text-right`}>Precio venta</th>
          </tr>
        </thead>
        <tbody>
          {isPending ? (
            <SkeletonRows />
          ) : (
            books.map((book) => (
              <tr
                key={book.id}
                className="h-14 border-b border-line transition-colors last:border-0 hover:bg-paper"
              >
                <td className="px-4">
                  <div className="font-medium text-ink">{book.title}</div>
                  <div className="text-xs text-muted">{book.author}</div>
                </td>
                <td className="px-4 font-mono text-xs text-muted">{book.isbn}</td>
                <td className="px-4">{book.category}</td>
                <td className="px-4 text-right">
                  <StockCell quantity={book.stock_quantity} />
                </td>
                <td className="px-4 text-right">
                  <Amount value={book.cost_usd} />
                </td>
                <td className="px-4 text-right">
                  <Amount value={book.selling_price_local} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Stacked cards below md, so nothing is cut off on a phone */}
      <ul className="md:hidden">
        {isPending
          ? Array.from({ length: 4 }, (_, row) => (
              <li key={row} className="border-b border-line p-4 last:border-0">
                <div className="h-4 animate-pulse rounded-field bg-paper" />
              </li>
            ))
          : books.map((book) => (
              <li key={book.id} className="border-b border-line p-4 last:border-0">
                <div className="font-medium text-ink">{book.title}</div>
                <div className="text-xs text-muted">{book.author}</div>
                <div className="mt-1 font-mono text-xs text-muted">{book.isbn}</div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted">{book.category}</span>
                  <StockCell quantity={book.stock_quantity} />
                </div>
                <div className="mt-2 flex justify-between text-xs">
                  <span className="text-muted">
                    Costo <Amount value={book.cost_usd} /> USD
                  </span>
                  <span className="text-muted">
                    Venta <Amount value={book.selling_price_local} />
                  </span>
                </div>
              </li>
            ))}
      </ul>
    </div>
  );
}
