 import { Injectable, Logger } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  import axios from 'axios';

  import { ExchangeRateUnavailableError } from '../../domain/errors/exchange-rate-unavailable.error';
  import {
    ExchangeRateProvider,
    ExchangeRateResult,
  } from '../../domain/ports/exchange-rate.provider';

  interface ExchangeRateApiResponse {
    rates?: Record<string, number | undefined>;
  }

  @Injectable()
  export class ExchangeRateApiProvider implements ExchangeRateProvider {
    private readonly logger = new Logger(ExchangeRateApiProvider.name);

    private readonly apiUrl: string;
    private readonly timeoutMs: number;
    private readonly fallbackRate: number | null;

    constructor(config: ConfigService) {
      this.apiUrl = config.getOrThrow<string>('EXCHANGE_RATE_API_URL');

      this.timeoutMs = Number(config.getOrThrow<string>('EXCHANGE_RATE_TIMEOUT_MS'));
      if (!Number.isFinite(this.timeoutMs) || this.timeoutMs <= 0) {
        throw new Error('EXCHANGE_RATE_TIMEOUT_MS must be a positive number of milliseconds');
      }
      const fallback = Number(config.get<string>('EXCHANGE_RATE_FALLBACK'));
      this.fallbackRate = Number.isFinite(fallback) && fallback > 0 ? fallback : null;
    }

    async getRate(targetCurrency: string): Promise<ExchangeRateResult> {
      try {
        const response = await axios.get<ExchangeRateApiResponse>(this.apiUrl, {
          timeout: this.timeoutMs,
        });

        const rate = response.data.rates?.[targetCurrency];
        if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) {
          throw new Error(`response has no usable rate for ${targetCurrency}`);
        }

        return { rate, currency: targetCurrency, source: 'api' };
      } catch (error) {
        return this.useFallback(targetCurrency, error);
      }
    }

    private useFallback(targetCurrency: string, error: unknown): ExchangeRateResult {
      if (this.fallbackRate === null) {
        this.logger.error(
          `Exchange rate lookup failed (${this.describe(error)}) and no fallback is configured`,
        );
        throw new ExchangeRateUnavailableError(targetCurrency);
      }

      this.logger.warn(
        `Exchange rate lookup failed (${this.describe(error)}); using fallback rate ${this.fallbackRate}`,
      );

      return { rate: this.fallbackRate, currency: targetCurrency, source: 'fallback' };
    }

    private describe(error: unknown): string {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          return `timed out after ${this.timeoutMs}ms`;
        }
        if (error.response !== undefined) {
          return `HTTP ${error.response.status}`;
        }
        return error.code ?? error.message;
      }
      return error instanceof Error ? error.message : String(error);
    }
  }