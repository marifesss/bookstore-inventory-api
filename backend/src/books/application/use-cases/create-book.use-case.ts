import { Inject, Injectable } from '@nestjs/common';

  import { Book } from '../../domain/book.entity';
  import { DuplicateIsbnError } from '../../domain/errors/duplicate-isbn.error';
  import {
    BOOK_REPOSITORY,
    type BookRepository,
  } from '../../domain/ports/book.repository';
  import { Isbn } from '../../domain/value-objects/isbn.vo';
  export interface CreateBookCommand {
    title: string;
    author: string;
    isbn: string;
    costUsd: number;
    stockQuantity: number;
    category: string;
    supplierCountry: string;
  }
  @Injectable()
  export class CreateBookUseCase {
    constructor(
      @Inject(BOOK_REPOSITORY)
      private readonly books: BookRepository,
    ) {}
    async execute(command: CreateBookCommand): Promise<Book> {
      const isbn = Isbn.create(command.isbn);
      const existing = await this.books.findByIsbn(isbn);
      if (existing !== null) {
        throw new DuplicateIsbnError(isbn.value);
      }
      const book = Book.create({ ...command, isbn });
      return this.books.create(book);
    }
  }