import { Inject, Injectable } from '@nestjs/common';
  import {
    normalizePagination,
    type PaginationQuery,
  } from '../../../shared/pagination/normalize-pagination';
  import { PaginatedResult } from '../../../shared/pagination/paginated-result';
  import { Book } from '../../domain/book.entity';
  import {
    BOOK_REPOSITORY,
    type BookRepository,
  } from '../../domain/ports/book.repository';

  export const DEFAULT_LOW_STOCK_THRESHOLD = 10;

  export interface ListLowStockBooksQuery extends PaginationQuery {
    threshold?: number;
  }

  @Injectable()
  export class ListLowStockBooksUseCase {
    constructor(
      @Inject(BOOK_REPOSITORY)
      private readonly books: BookRepository,
    ) {}

    async execute(
      query: ListLowStockBooksQuery = {},
    ): Promise<PaginatedResult<Book>> {
      const threshold = Math.max(
        query.threshold ?? DEFAULT_LOW_STOCK_THRESHOLD,
        0,
      );

      return this.books.findMany({
        ...normalizePagination(query),
        stockBelow: threshold,
      });
    }
  }