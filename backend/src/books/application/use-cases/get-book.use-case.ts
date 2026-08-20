import { Inject, Injectable } from '@nestjs/common';
  import { Book } from '../../domain/book.entity';
  import { BookNotFoundError } from '../../domain/errors/book-not-found.error';
  import {
    BOOK_REPOSITORY,
    type BookRepository,
  } from '../../domain/ports/book.repository';
  @Injectable()
  export class GetBookUseCase {
    constructor(
      @Inject(BOOK_REPOSITORY)
      private readonly books: BookRepository,
    ) {}
    async execute(id: number): Promise<Book> {
      const book = await this.books.findById(id);
      if (book === null) {
        throw new BookNotFoundError(id);
      }
      return book;
    }
  }