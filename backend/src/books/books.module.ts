import { Module } from '@nestjs/common';

  import { PrismaModule } from '../shared/prisma/prisma.module';
  import { CreateBookUseCase } from './application/use-cases/create-book.use-case';
  import { DeleteBookUseCase } from './application/use-cases/delete-book.use-case';
  import { GetBookUseCase } from './application/use-cases/get-book.use-case';
  import { ListBooksUseCase } from './application/use-cases/list-books.use-case';
  import { ListLowStockBooksUseCase } from './application/use-cases/list-low-stock-books.use-case';
  import { SearchBooksByCategoryUseCase } from './application/use-cases/search-books-by-category.use-case';
  import { UpdateBookUseCase } from './application/use-cases/update-book.use-case';
  import { BOOK_REPOSITORY } from './domain/ports/book.repository';
  import { PrismaBookRepository } from './infrastructure/persistence/prisma-book.repository';

  @Module({
    imports: [PrismaModule],
    providers: [
      { provide: BOOK_REPOSITORY, useClass: PrismaBookRepository },

      CreateBookUseCase,
      GetBookUseCase,
      ListBooksUseCase,
      UpdateBookUseCase,
      DeleteBookUseCase,
      SearchBooksByCategoryUseCase,
      ListLowStockBooksUseCase,
    ],
  })
  export class BooksModule {}