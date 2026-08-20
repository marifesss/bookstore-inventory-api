export interface Book {
    id: number;
    title: string;
    author: string;
    isbn: string;
    cost_usd: number;
    selling_price_local: number | null;
    stock_quantity: number;
    category: string;
    supplier_country: string;
    created_at: string;
    updated_at: string;
  }

  export interface PaginatedBooks {
    items: Book[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }

  export interface PriceBreakdown {
    book_id: number;
    cost_usd: number;
    exchange_rate: number;
    cost_local: number;
    margin_percentage: number;
    selling_price_local: number;
    currency: string;
    rate_source: 'api' | 'fallback';
    calculation_timestamp: string;
  }

  export type BookPayload = Omit<
    Book,
    'id' | 'selling_price_local' | 'created_at' | 'updated_at'
  >;