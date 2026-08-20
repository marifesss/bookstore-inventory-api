import { Inject, Injectable } from '@nestjs/common';

  import { Book } from '../../domain/book.entity';
  import { DuplicateIsbnError } from '../../domain/errors/duplicate-isbn.error';
  import {
    BOOK_REPOSITORY,
    type BookRepository,
  } from '../../domain/ports/book.repository';
  import { Isbn } from '../../domain/value-objects/isbn.vo';
  import { GetBookUseCase } from './get-book.use-case';
  export interface UpdateBookCommand {
    title: string;
    author: string;
    isbn: string;
    costUsd: number;
    stockQuantity: number;
    category: string;
    supplierCountry: string;
  }

  @Injectable()
  export class UpdateBookUseCase {
    constructor(
      @Inject(BOOK_REPOSITORY)
      private readonly books: BookRepository,
      private readonly getBook: GetBookUseCase,
    ) {}

    async execute(id: number, command: UpdateBookCommand): Promise<Book> {
      const existing = await this.getBook.execute(id);
      const isbn = Isbn.create(command.isbn);
      if (!isbn.equals(existing.isbn)) {
        const other = await this.books.findByIsbn(isbn);
        if (other !== null) {
          throw new DuplicateIsbnError(isbn.value);
        }
      }
      const updated = existing.update({ ...command, isbn });
      return this.books.update(id, updated);
    }
  }