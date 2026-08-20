import { useState } from 'react';

import type { BookFilters } from '../hooks/useBooks';
import { DEFAULT_LOW_STOCK_THRESHOLD } from '../hooks/useBooks';

interface FilterPanelProps {
  filters: BookFilters;
  onChange: (filters: BookFilters) => void;
}

export function FilterPanel({ filters, onChange }: FilterPanelProps) {
  // Local draft: the request only fires when the search is submitted, not on
  // every keystroke.
  const [category, setCategory] = useState(
    filters.mode === 'category' ? filters.category : '',
  );

  const isLowStock = filters.mode === 'lowStock';

  const secondary =
    'h-10 rounded-card border border-line bg-surface px-4 font-medium text-ink transition-colors hover:bg-paper';

  return (
    <div className="rounded-card bg-surface p-6 shadow-card">
      <div className="flex flex-wrap items-end gap-4">
        <form
          className="flex flex-1 flex-wrap items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const trimmed = category.trim();

            onChange(
              trimmed === ''
                ? { mode: 'all', page: 1 }
                : { mode: 'category', category: trimmed, page: 1 },
            );
          }}
        >
          <div className="min-w-[240px] flex-1">
            <label
              htmlFor="category"
              className="mb-1 block text-xs font-medium text-ink"
            >
              Categoría
            </label>
            <input
              id="category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Literatura Clásica"
              className="h-10 w-full rounded-field border border-line px-3 text-base outline-none focus:border-forest"
            />
            <p className="mt-1 text-xs text-muted">
              Nombre exacto de la categoría, con sus acentos.
            </p>
          </div>

          <button
            type="submit"
            className="h-10 rounded-card bg-forest px-4 font-medium text-white transition-colors hover:bg-forest/90"
          >
            Buscar
          </button>
        </form>

        <div className="flex items-end gap-3">
          <button
            type="button"
            aria-pressed={isLowStock}
            className={
              isLowStock
                ? 'h-10 rounded-card bg-amber-tint px-4 font-medium text-amber'
                : secondary
            }
            onClick={() =>
              onChange(
                isLowStock
                  ? { mode: 'all', page: 1 }
                  : {
                      mode: 'lowStock',
                      threshold: DEFAULT_LOW_STOCK_THRESHOLD,
                      page: 1,
                    },
              )
            }
          >
            Stock bajo
          </button>

          {filters.mode !== 'all' && (
            <button
              type="button"
              className={secondary}
              onClick={() => {
                setCategory('');
                onChange({ mode: 'all', page: 1 });
              }}
            >
              Limpiar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
