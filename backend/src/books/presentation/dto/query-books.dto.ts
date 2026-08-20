import { Type } from 'class-transformer';
  import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

  export class PaginationQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number;
  }

  export class SearchBooksQueryDto extends PaginationQueryDto {
    @IsString()
    @IsNotEmpty()
    category!: string;
  }

  export class LowStockQueryDto extends PaginationQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    threshold?: number;
  }