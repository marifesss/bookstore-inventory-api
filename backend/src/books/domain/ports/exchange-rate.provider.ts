export const EXCHANGE_RATE_PROVIDER = Symbol('EXCHANGE_RATE_PROVIDER');
  export type ExchangeRateSource = 'api' | 'fallback';
  export interface ExchangeRateResult {
    rate: number;
    currency: string;
    source: ExchangeRateSource;
  }
  export interface ExchangeRateProvider {
    getRate(targetCurrency: string): Promise<ExchangeRateResult>;
  }