import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
  } from '@nestjs/common';

  import { CreateBookUseCase } from '../application/use-cases/create-book.use-case';
  import { DeleteBookUseCase } from '../application/use-cases/delete-book.use-case';
  import { GetBookUseCase } from '../application/use-cases/get-book.use-case';
  import { ListBooksUseCase } from '../application/use-cases/list-books.use-case';
  import { ListLowStockBooksUseCase } from '../application/use-cases/list-low-stock-books.use-case';
  import { SearchBooksByCategoryUseCase } from '../application/use-cases/search-books-by-category.use-case';
  import { UpdateBookUseCase } from '../application/use-cases/update-book.use-case';
  import {
    BookResponseDto,
    type BookResponse,
    type PaginatedBooksResponse,
  } from './dto/book-response.dto';
  import { CreateBookDto } from './dto/create-book.dto';
  import {
    LowStockQueryDto,
    PaginationQueryDto,
    SearchBooksQueryDto,
  } from './dto/query-books.dto';
  import { UpdateBookDto } from './dto/update-book.dto';

  @Controller('books')
  export class BooksController {
    constructor(
      private readonly createBook: CreateBookUseCase,
      private readonly getBook: GetBookUseCase,
      private readonly listBooks: ListBooksUseCase,
      private readonly updateBook: UpdateBookUseCase,
      private readonly deleteBook: DeleteBookUseCase,
      private readonly searchBooks: SearchBooksByCategoryUseCase,
      private readonly listLowStockBooks: ListLowStockBooksUseCase,
    ) {}

    /** 201 Created is NestJS's default for POST. */
    @Post()
    async create(@Body() dto: CreateBookDto): Promise<BookResponse> {
      const book = await this.createBook.execute(this.toCommand(dto));

      return BookResponseDto.fromDomain(book);
    }

    @Get()
    async list(
      @Query() query: PaginationQueryDto,
    ): Promise<PaginatedBooksResponse> {
      const result = await this.listBooks.execute(query);

      return BookResponseDto.fromPaginated(result);
    }
    @Get('search')
    async search(
      @Query() query: SearchBooksQueryDto,
    ): Promise<PaginatedBooksResponse> {
      const result = await this.searchBooks.execute(query);

      return BookResponseDto.fromPaginated(result);
    }

    @Get('low-stock')
    async lowStock(
      @Query() query: LowStockQueryDto,
    ): Promise<PaginatedBooksResponse> {
      const result = await this.listLowStockBooks.execute(query);

      return BookResponseDto.fromPaginated(result);
    }

    @Get(':id')
    async findOne(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<BookResponse> {
      const book = await this.getBook.execute(id);

      return BookResponseDto.fromDomain(book);
    }

    @Put(':id')
    async update(
      @Param('id', ParseIntPipe) id: number,
      @Body() dto: UpdateBookDto,
    ): Promise<BookResponse> {
      const book = await this.updateBook.execute(id, this.toCommand(dto));

      return BookResponseDto.fromDomain(book);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
      await this.deleteBook.execute(id);
    }

    private toCommand(dto: CreateBookDto) {
      return {
        title: dto.title,
        author: dto.author,
        isbn: dto.isbn,
        costUsd: dto.cost_usd,
        stockQuantity: dto.stock_quantity,
        category: dto.category,
        supplierCountry: dto.supplier_country,
      };
    }
  }