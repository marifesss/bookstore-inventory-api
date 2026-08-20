 import { Inject, Injectable } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';

  import { roundToCents } from '../../../shared/money/round-to-cents';
  import {
    BOOK_REPOSITORY,
    type BookRepository,
  } from '../../domain/ports/book.repository';
  import {
    EXCHANGE_RATE_PROVIDER,
    type ExchangeRateProvider,
    type ExchangeRateSource,
  } from '../../domain/ports/exchange-rate.provider';
  import { GetBookUseCase } from './get-book.use-case';

  export interface PriceCalculationResult {
    bookId: number;
    costUsd: number;
    exchangeRate: number;
    costLocal: number;
    marginPercentage: number;
    sellingPriceLocal: number;
    currency: string;
    rateSource: ExchangeRateSource;
    calculatedAt: Date;
  }

  @Injectable()
  export class CalculateSellingPriceUseCase {
    private readonly localCurrency: string;
    private readonly marginPercentage: number;

    constructor(
      @Inject(BOOK_REPOSITORY)
      private readonly books: BookRepository,
      @Inject(EXCHANGE_RATE_PROVIDER)
      private readonly exchangeRates: ExchangeRateProvider,
      private readonly getBook: GetBookUseCase,
      config: ConfigService,
    ) {
      this.localCurrency = config.getOrThrow<string>('LOCAL_CURRENCY');

      this.marginPercentage = Number(config.getOrThrow<string>('DEFAULT_MARGIN_PERCENTAGE'));
      if (!Number.isFinite(this.marginPercentage) || this.marginPercentage < 0) {
        throw new Error('DEFAULT_MARGIN_PERCENTAGE must be a number greater than or equal to 0');
      }
    }

    async execute(id: number): Promise<PriceCalculationResult> {
      const book = await this.getBook.execute(id);

      const { rate, currency, source } = await this.exchangeRates.getRate(this.localCurrency);

      const breakdown = book.calculateSellingPrice(rate, this.marginPercentage);
      const sellingPriceLocal = roundToCents(breakdown.sellingPriceLocal);

      await this.books.update(id, book.withSellingPrice(sellingPriceLocal));

      return {
        bookId: id,
        costUsd: breakdown.costUsd,
        exchangeRate: breakdown.exchangeRate,
        costLocal: breakdown.costLocal,
        marginPercentage: breakdown.marginPercentage,
        sellingPriceLocal,
        currency,
        rateSource: source,
        calculatedAt: new Date(),
      };
    }
  }