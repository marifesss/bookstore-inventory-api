import { DomainError } from './domain.error';
  export class ExchangeRateUnavailableError extends DomainError {
    readonly code = 'EXCHANGE_RATE_UNAVAILABLE';
    constructor(targetCurrency: string) {
      super(
        `Could not obtain an exchange rate for ${targetCurrency} and no fallback rate is configured`,
      );
    }
  }