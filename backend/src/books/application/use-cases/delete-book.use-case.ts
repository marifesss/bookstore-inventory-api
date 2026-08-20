 import { Inject, Injectable } from '@nestjs/common';
  import {
    BOOK_REPOSITORY,
    type BookRepository,
  } from '../../domain/ports/book.repository';
  import { GetBookUseCase } from './get-book.use-case';
  @Injectable()
  export class DeleteBookUseCase {
    constructor(
      @Inject(BOOK_REPOSITORY)
      private readonly books: BookRepository,
      private readonly getBook: GetBookUseCase,
    ) {}
    async execute(id: number): Promise<void> {
      await this.getBook.execute(id);
      await this.books.delete(id);
    }
  }