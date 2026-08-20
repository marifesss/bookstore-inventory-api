import type { Book, BookPayload } from '../../../types/book';

export interface BookFormValues {
  title: string;
  author: string;
  isbn: string;
  cost_usd: string;
  stock_quantity: string;
  category: string;
  supplier_country: string;
}

export type BookFormErrors = Partial<Record<keyof BookFormValues, string>>;

export const EMPTY_BOOK_FORM: BookFormValues = {
  title: '',
  author: '',
  isbn: '',
  cost_usd: '',
  stock_quantity: '',
  category: '',
  supplier_country: '',
};

/** Inputs hold strings; a persisted book has to be turned back into one. */
export function toFormValues(book: Book | null): BookFormValues {
  if (book === null) {
    return EMPTY_BOOK_FORM;
  }

  return {
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    cost_usd: String(book.cost_usd),
    stock_quantity: String(book.stock_quantity),
    category: book.category,
    supplier_country: book.supplier_country,
  };
}

export function toPayload(values: BookFormValues): BookPayload {
  return {
    title: values.title.trim(),
    author: values.author.trim(),
    isbn: values.isbn.trim(),
    cost_usd: Number(values.cost_usd),
    stock_quantity: Number(values.stock_quantity),
    category: values.category.trim(),
    supplier_country: values.supplier_country.trim().toUpperCase(),
  };
}

/**
 * The same rules the backend enforces, checked before spending a request.
 * The server stays the authority: this only saves a round trip and gives the
 * error next to the field instead of in a toast.
 */
export function validateBook(values: BookFormValues): BookFormErrors {
  const errors: BookFormErrors = {};

  if (values.title.trim() === '') {
    errors.title = 'El título es obligatorio.';
  }

  if (values.author.trim() === '') {
    errors.author = 'El autor es obligatorio.';
  }

  if (values.category.trim() === '') {
    errors.category = 'La categoría es obligatoria.';
  }

  // Hyphens and spaces are ignored, exactly like the Isbn value object does.
  const isbnDigits = values.isbn.replace(/[\s-]/g, '');

  if (isbnDigits === '') {
    errors.isbn = 'El ISBN es obligatorio.';
  } else if (!/^(\d{10}|\d{13})$/.test(isbnDigits)) {
    errors.isbn = 'El ISBN debe tener 10 o 13 dígitos.';
  }

  const cost = Number(values.cost_usd);

  if (values.cost_usd.trim() === '') {
    errors.cost_usd = 'El costo es obligatorio.';
  } else if (!Number.isFinite(cost) || cost <= 0) {
    errors.cost_usd = 'El costo debe ser mayor que 0.';
  }

  const stock = Number(values.stock_quantity);

  if (values.stock_quantity.trim() === '') {
    errors.stock_quantity = 'El stock es obligatorio.';
  } else if (!Number.isInteger(stock) || stock < 0) {
    errors.stock_quantity = 'El stock debe ser un entero de 0 o más.';
  }

  if (!/^[A-Za-z]{2}$/.test(values.supplier_country.trim())) {
    errors.supplier_country = 'Usa el código ISO de 2 letras, por ejemplo ES.';
  }

  return errors;
}
