 import { roundToCents } from '../../../shared/money/round-to-cents';
  import { PaginatedResult } from '../../../shared/pagination/paginated-result';
  import { Book } from '../../domain/book.entity';


  export interface BookResponse {
    id: number;
    title: string;
    author: string;
    isbn: string;
    cost_usd: number;
    selling_price_local: number | null;
    stock_quantity: number;
    category: string;
    supplier_country: string;
    created_at: string;
    updated_at: string;
  }

  export interface PaginatedBooksResponse {
    items: BookResponse[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }

  export class BookResponseDto {
    static fromDomain(book: Book): BookResponse {
    
      if (book.id === null || book.createdAt === null || book.updatedAt === null) {
        throw new Error('Cannot serialize a book that has not been persisted');
      }

      return {
        id: book.id,
        title: book.title,
        author: book.author,
        isbn: book.isbn.value,
        cost_usd: roundToCents(book.costUsd),
        selling_price_local:
          book.sellingPriceLocal === null
            ? null
            : roundToCents(book.sellingPriceLocal),
        stock_quantity: book.stockQuantity,
        category: book.category,
        supplier_country: book.supplierCountry,
        created_at: book.createdAt.toISOString(),
        updated_at: book.updatedAt.toISOString(),
      };
    }

    static fromPaginated(result: PaginatedResult<Book>): PaginatedBooksResponse {
      return {
        items: result.items.map((book) => BookResponseDto.fromDomain(book)),
        total: result.total,
        page: result.page,
        limit: result.limit,
        total_pages: Math.ceil(result.total / result.limit),
      };
    }
  }