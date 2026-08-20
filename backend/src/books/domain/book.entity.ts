import { InvalidBookDataError } from './errors/invalid-book-data.error';
  import { Isbn } from './value-objects/isbn.vo';
  export interface BookDetails {
    title: string;
    author: string;
    isbn: Isbn;
    costUsd: number;
    stockQuantity: number;
    category: string;
    supplierCountry: string;
  }

  interface BookState extends BookDetails {
    id: number | null;
    sellingPriceLocal: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  }

  export interface PersistedBookState extends BookDetails {
    id: number;
    sellingPriceLocal: number | null;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface PriceBreakdown {
    costUsd: number;
    exchangeRate: number;
    costLocal: number;
    marginPercentage: number;
    sellingPriceLocal: number;
  }

  export class Book {
    readonly id: number | null;
    readonly title: string;
    readonly author: string;
    readonly isbn: Isbn;
    readonly costUsd: number;
    readonly sellingPriceLocal: number | null;
    readonly stockQuantity: number;
    readonly category: string;
    readonly supplierCountry: string;
    readonly createdAt: Date | null;
    readonly updatedAt: Date | null;

    private constructor(state: BookState) {
      const title = state.title.trim();
      const author = state.author.trim();
      const category = state.category.trim();
      const supplierCountry = state.supplierCountry.trim().toUpperCase();
      if (title.length === 0) {
        throw new InvalidBookDataError('Book title must not be empty');
      }
      if (author.length === 0) {
        throw new InvalidBookDataError('Book author must not be empty');
      }
      if (category.length === 0) {
        throw new InvalidBookDataError('Book category must not be empty');
      }
      if (!/^[A-Z]{2}$/.test(supplierCountry)) {
        throw new InvalidBookDataError(
          `Supplier country must be a 2-letter ISO code, got "${state.supplierCountry}"`,
        );
      }
      if (!Number.isFinite(state.costUsd) || state.costUsd <= 0) {
        throw new InvalidBookDataError(
          `Cost in USD must be greater than 0, got ${state.costUsd}`,
        );
      }
      if (!Number.isInteger(state.stockQuantity) || state.stockQuantity < 0) {
        throw new InvalidBookDataError(
          `Stock quantity must be an integer greater than or equal to 0, got ${state.stockQuantity}`,
        );
      }
      if (state.sellingPriceLocal !== null && state.sellingPriceLocal < 0) {
        throw new InvalidBookDataError(
          `Selling price must not be negative, got ${state.sellingPriceLocal}`,
        );
      }
      this.id = state.id;
      this.title = title;
      this.author = author;
      this.isbn = state.isbn;
      this.costUsd = state.costUsd;
      this.sellingPriceLocal = state.sellingPriceLocal;
      this.stockQuantity = state.stockQuantity;
      this.category = category;
      this.supplierCountry = supplierCountry;
      this.createdAt = state.createdAt;
      this.updatedAt = state.updatedAt;
    }
    static create(details: BookDetails): Book {
      return new Book({
        ...details,
        id: null,
        sellingPriceLocal: null,
        createdAt: null,
        updatedAt: null,
      });
    }
    static fromPersistence(state: PersistedBookState): Book {
      return new Book(state);
    }
    update(details: BookDetails): Book {
      return new Book({
        ...details,
        id: this.id,
        sellingPriceLocal: this.sellingPriceLocal,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
      });
    }
    withSellingPrice(sellingPriceLocal: number): Book {
      return new Book({ ...this, sellingPriceLocal });
    }

    calculateSellingPrice(
      exchangeRate: number,
      marginPercentage: number,
    ): PriceBreakdown {
      if (!Number.isFinite(exchangeRate) || exchangeRate <= 0) {
        throw new InvalidBookDataError(
          `Exchange rate must be greater than 0, got ${exchangeRate}`,
        );
      }
      if (!Number.isFinite(marginPercentage) || marginPercentage < 0) {
        throw new InvalidBookDataError(
          `Margin percentage must not be negative, got ${marginPercentage}`,
        );
      }
      const costLocal = this.costUsd * exchangeRate;
      const sellingPriceLocal = costLocal * (1 + marginPercentage / 100);
      return {
        costUsd: this.costUsd,
        exchangeRate,
        costLocal,
        marginPercentage,
        sellingPriceLocal,
      };
    }
    isLowStock(threshold: number): boolean {
      return this.stockQuantity < threshold;
    }
  }