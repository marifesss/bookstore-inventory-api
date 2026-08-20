 import {
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsPositive,
    IsString,
    MaxLength,
    Min,
  } from 'class-validator';

  export class CreateBookDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    title!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    author!: string;

    @IsString()
    @IsNotEmpty()
    isbn!: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    cost_usd!: number;

    @IsInt()
    @Min(0)
    stock_quantity!: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(120)
    category!: string;

    @IsString()
    @IsNotEmpty()
    supplier_country!: string;
  }