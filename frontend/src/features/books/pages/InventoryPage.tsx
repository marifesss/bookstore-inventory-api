import { useState } from 'react';

import type { Book } from '../../../types/book';
import { BookForm } from '../components/BookForm';
import { BookTable } from '../components/BookTable';
import { FilterPanel } from '../components/FilterPanel';
import { Pagination } from '../components/Pagination';
import type { BookFilters } from '../hooks/useBooks';
import { useBooks } from '../hooks/useBooks';

/** null = closed, { book: null } = creating, { book } = editing. */
type FormState = { book: Book | null } | null;

export function InventoryPage() {
  const [filters, setFilters] = useState<BookFilters>({ mode: 'all', page: 1 });
  const [form, setForm] = useState<FormState>(null);

  const { data, error, isPending, isFetching } = useBooks(filters);
  const books = data?.items ?? [];

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-6">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-[30px] font-bold leading-[1.15] tracking-[-0.02em] text-ink">
              Inventario
            </h1>
            <p className="mt-1 text-muted">Catálogo de libros importados</p>
          </div>

          <button
            type="button"
            onClick={() => setForm({ book: null })}
            className="h-10 rounded-card bg-forest px-4 font-medium text-white transition-colors hover:bg-forest/90"
          >
            Nuevo libro
          </button>
        </header>

        <div className="mb-6">
          <FilterPanel filters={filters} onChange={setFilters} />
        </div>

        {error !== null && (
          <div className="mb-6 rounded-card border border-danger bg-danger-tint p-4 text-danger">
            No se pudo cargar el inventario: {error.message}
          </div>
        )}

        {!isPending && books.length === 0 && error === null ? (
          <div className="rounded-card bg-surface p-12 text-center shadow-card">
            <p className="text-ink">
              {filters.mode === 'all'
                ? 'Todavía no hay libros en el inventario.'
                : 'Ningún libro coincide con este filtro.'}
            </p>

            {filters.mode === 'all' && (
              <button
                type="button"
                onClick={() => setForm({ book: null })}
                className="mt-4 h-10 rounded-card bg-forest px-4 font-medium text-white transition-colors hover:bg-forest/90"
              >
                Añadir el primero
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <BookTable
              books={books}
              isPending={isPending}
              onEdit={(book) => setForm({ book })}
            />

            <Pagination
              page={filters.page}
              totalPages={data?.total_pages ?? 1}
              total={data?.total ?? 0}
              isFetching={isFetching}
              onPageChange={(page) => setFilters({ ...filters, page })}
            />
          </div>
        )}
      </div>

      {form !== null && (
        <BookForm book={form.book} onClose={() => setForm(null)} />
      )}
    </div>
  );
}
