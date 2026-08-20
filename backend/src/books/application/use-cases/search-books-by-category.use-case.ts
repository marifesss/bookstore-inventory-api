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

  export interface SearchBooksByCategoryQuery extends PaginationQuery {
    category: string;
  }

  @Injectable()
  export class SearchBooksByCategoryUseCase {
    constructor(
      @Inject(BOOK_REPOSITORY)
      private readonly books: BookRepository,
    ) {}

    async execute(
      query: SearchBooksByCategoryQuery,
    ): Promise<PaginatedResult<Book>> {
      return this.books.findMany({
        ...normalizePagination(query),
        category: query.category.trim(),
      });
    }
  }