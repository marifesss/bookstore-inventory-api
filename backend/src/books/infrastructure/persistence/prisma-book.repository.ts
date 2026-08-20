import { Injectable } from '@nestjs/common';
  import { Prisma } from '@prisma/client';

  import { PaginatedResult } from '../../../shared/pagination/paginated-result';
  import { PrismaService } from '../../../shared/prisma/prisma.service';
  import { Book } from '../../domain/book.entity';
  import { DuplicateIsbnError } from '../../domain/errors/duplicate-isbn.error';
  import type {
    BookFilter,
    BookRepository,
  } from '../../domain/ports/book.repository';
  import { Isbn } from '../../domain/value-objects/isbn.vo';
  import { BookMapper } from './book.mapper';

  @Injectable()
  export class PrismaBookRepository implements BookRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(book: Book): Promise<Book> {
      try {
        const row = await this.prisma.book.create({
          data: BookMapper.toPersistence(book),
        });

        return BookMapper.toDomain(row);
      } catch (error) {
        throw this.translateError(error, book.isbn);
      }
    }

    async update(id: number, book: Book): Promise<Book> {
      try {
        const row = await this.prisma.book.update({
          where: { id },
          data: BookMapper.toPersistence(book),
        });

        return BookMapper.toDomain(row);
      } catch (error) {
        throw this.translateError(error, book.isbn);
      }
    }

    async findById(id: number): Promise<Book | null> {
      const row = await this.prisma.book.findUnique({ where: { id } });

      return row === null ? null : BookMapper.toDomain(row);
    }

    async findByIsbn(isbn: Isbn): Promise<Book | null> {
      const row = await this.prisma.book.findUnique({
        where: { isbn: isbn.value },
      });

      return row === null ? null : BookMapper.toDomain(row);
    }

    async delete(id: number): Promise<void> {
      await this.prisma.book.delete({ where: { id } });
    }

    async findMany(filter: BookFilter): Promise<PaginatedResult<Book>> {
      const where: Prisma.BookWhereInput = {};

      if (filter.category !== undefined) {
        where.category = { equals: filter.category, mode: 'insensitive' };
      }

      if (filter.stockBelow !== undefined) {
        where.stockQuantity = { lt: filter.stockBelow };
      }

      const [rows, total] = await this.prisma.$transaction([
        this.prisma.book.findMany({
          where,
          orderBy: { id: 'asc' },
          skip: (filter.page - 1) * filter.limit,
          take: filter.limit,
        }),
        this.prisma.book.count({ where }),
      ]);

      return {
        items: rows.map((row) => BookMapper.toDomain(row)),
        total,
        page: filter.page,
        limit: filter.limit,
      };
    }

    private translateError(error: unknown, isbn: Isbn): unknown {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return new DuplicateIsbnError(isbn.value);
      }

      return error;
    }
  }