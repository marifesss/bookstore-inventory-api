import { useState } from 'react';
import type { FormEvent } from 'react';

import { Modal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';
import type { ApiError } from '../../../api/client';
import type { Book } from '../../../types/book';
import { useCreateBook, useUpdateBook } from '../hooks/useBookMutations';
import type { BookFormErrors, BookFormValues } from '../lib/validateBook';
import { toFormValues, toPayload, validateBook } from '../lib/validateBook';

interface BookFormProps {
  /** null creates a new book; a book edits it. */
  book: Book | null;
  onClose: () => void;
}

interface FieldProps {
  id: keyof BookFormValues;
  label: string;
  values: BookFormValues;
  errors: BookFormErrors;
  onChange: (id: keyof BookFormValues, value: string) => void;
  hint?: string;
  mono?: boolean;
}

function Field({ id, label, values, errors, onChange, hint, mono }: FieldProps) {
  const error = errors[id];

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        value={values[id]}
        onChange={(event) => onChange(id, event.target.value)}
        aria-invalid={error !== undefined}
        className={`h-10 w-full rounded-field border px-3 text-base outline-none ${
          mono === true ? 'font-mono' : ''
        } ${error === undefined ? 'border-line focus:border-forest' : 'border-danger'}`}
      />
      {error === undefined
        ? hint !== undefined && <p className="mt-1 text-xs text-muted">{hint}</p>
        : <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

export function BookForm({ book, onClose }: BookFormProps) {
  const [values, setValues] = useState<BookFormValues>(() => toFormValues(book));
  const [errors, setErrors] = useState<BookFormErrors>({});

  const showToast = useToast();
  const create = useCreateBook();
  const update = useUpdateBook();
  const isSaving = create.isPending || update.isPending;

  const change = (id: keyof BookFormValues, value: string) => {
    setValues((current) => ({ ...current, [id]: value }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const found = validateBook(values);
    setErrors(found);

    // Nothing leaves the browser until the form is valid.
    if (Object.keys(found).length > 0) {
      return;
    }

    const payload = toPayload(values);
    const handlers = {
      onSuccess: () => {
        showToast('success', book === null ? 'Libro creado' : 'Libro actualizado');
        onClose();
      },
      // The toast shows the message the API really sent, not a generic one.
      onError: (error: ApiError) => showToast('error', error.message),
    };

    if (book === null) {
      create.mutate(payload, handlers);
    } else {
      update.mutate({ id: book.id, payload }, handlers);
    }
  };

  return (
    <Modal title={book === null ? 'Nuevo libro' : 'Editar libro'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field id="title" label="Título" values={values} errors={errors} onChange={change} />
        <Field id="author" label="Autor" values={values} errors={errors} onChange={change} />
        <Field
          id="isbn"
          label="ISBN"
          values={values}
          errors={errors}
          onChange={change}
          hint="10 o 13 dígitos, con o sin guiones."
          mono
        />

        <div className="grid grid-cols-2 gap-4">
          <Field
            id="cost_usd"
            label="Costo USD"
            values={values}
            errors={errors}
            onChange={change}
            mono
          />
          <Field
            id="stock_quantity"
            label="Stock"
            values={values}
            errors={errors}
            onChange={change}
            mono
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field id="category" label="Categoría" values={values} errors={errors} onChange={change} />
          <Field
            id="supplier_country"
            label="País del proveedor"
            values={values}
            errors={errors}
            onChange={change}
            hint="Código ISO, por ejemplo ES."
            mono
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-card border border-line bg-surface px-4 font-medium text-ink transition-colors hover:bg-paper"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="h-10 rounded-card bg-forest px-4 font-medium text-white transition-colors hover:bg-forest/90 disabled:opacity-60"
          >
            {isSaving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
