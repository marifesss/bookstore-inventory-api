  export const DEFAULT_PAGE = 1;
  export const DEFAULT_LIMIT = 10;
  export const MAX_LIMIT = 100;

  export interface PaginationQuery {
    page?: number;
    limit?: number;
  }
  export interface Pagination {
    page: number;
    limit: number;
  }
  export function normalizePagination(query: PaginationQuery = {}): Pagination {
    return {
      page: Math.max(query.page ?? DEFAULT_PAGE, 1),
      limit: Math.min(Math.max(query.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT),
    };
  }