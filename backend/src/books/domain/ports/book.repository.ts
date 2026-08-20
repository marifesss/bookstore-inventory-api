import { PaginatedResult } from '../../../shared/pagination/paginated-result';
  import { Book } from '../book.entity';
  import { Isbn } from '../value-objects/isbn.vo';
  export const BOOK_REPOSITORY = Symbol('BOOK_REPOSITORY');
  export interface BookFilter {
    page: number;
    limit: number;
    category?: string;
    stockBelow?: number;
  }
  export interface BookRepository {
    create(book: Book): Promise<Book>;
    findMany(filter: BookFilter): Promise<PaginatedResult<Book>>;
    findById(id: number): Promise<Book | null>;
    findByIsbn(isbn: Isbn): Promise<Book | null>;
    update(id: number, book: Book): Promise<Book>;
    delete(id: number): Promise<void>;
  }