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

  export type ListBooksQuery = PaginationQuery;

  @Injectable()
  export class ListBooksUseCase {
    constructor(
      @Inject(BOOK_REPOSITORY)
      private readonly books: BookRepository,
    ) {}

    async execute(query: ListBooksQuery = {}): Promise<PaginatedResult<Book>> {
      return this.books.findMany(normalizePagination(query));
    }
  }