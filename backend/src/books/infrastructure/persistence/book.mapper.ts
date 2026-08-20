
  import { Prisma } from '@prisma/client';
  import type { Book as BookRow } from '@prisma/client';
  import { Book } from '../../domain/book.entity';
  import { Isbn } from '../../domain/value-objects/isbn.vo';

  export class BookMapper {
   
    static toDomain(row: BookRow): Book {
      return Book.fromPersistence({
        id: row.id,
        title: row.title,
        author: row.author,
        isbn: Isbn.create(row.isbn),
        costUsd: row.costUsd.toNumber(),
        sellingPriceLocal: row.sellingPriceLocal?.toNumber() ?? null,
        stockQuantity: row.stockQuantity,
        category: row.category,
        supplierCountry: row.supplierCountry,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      });
    }
    static toPersistence(book: Book): Prisma.BookCreateInput {
      return {
        title: book.title,
        author: book.author,
        isbn: book.isbn.value,
        costUsd: new Prisma.Decimal(book.costUsd),
        sellingPriceLocal:
          book.sellingPriceLocal === null
            ? null
            : new Prisma.Decimal(book.sellingPriceLocal),
        stockQuantity: book.stockQuantity,
        category: book.category,
        supplierCountry: book.supplierCountry,
      };
    }
  }