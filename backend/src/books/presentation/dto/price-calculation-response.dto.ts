 import { roundToCents } from '../../../shared/money/round-to-cents';
  import { PriceCalculationResult } from '../../application/use-cases/calculate-selling-price.use-case';
  import type { ExchangeRateSource } from '../../domain/ports/exchange-rate.provider';

  export interface PriceCalculationResponse {
    book_id: number;
    cost_usd: number;
    exchange_rate: number;
    cost_local: number;
    margin_percentage: number;
    selling_price_local: number;
    currency: string;
    rate_source: ExchangeRateSource;
    calculation_timestamp: string;
  }

  export class PriceCalculationResponseDto {
    static fromResult(result: PriceCalculationResult): PriceCalculationResponse {
      return {
        book_id: result.bookId,
        cost_usd: roundToCents(result.costUsd),
        exchange_rate: result.exchangeRate,
        cost_local: roundToCents(result.costLocal),
        margin_percentage: result.marginPercentage,
        selling_price_local: roundToCents(result.sellingPriceLocal),
        currency: result.currency,
        rate_source: result.rateSource,
        calculation_timestamp: result.calculatedAt.toISOString(),
      };
    }
  }