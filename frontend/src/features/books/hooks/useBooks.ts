import { keepPreviousData, useQuery } from '@tanstack/react-query';

  import {
    listBooks,
    listLowStockBooks,
    searchBooksByCategory,
  } from '../../../api/books.api';
  import type { PaginatedBooks } from '../../../types/book';

  export const PAGE_SIZE = 10;
  export const DEFAULT_LOW_STOCK_THRESHOLD = 10;

  export type BookFilters =
    | { mode: 'all'; page: number }
    | { mode: 'category'; category: string; page: number }
    | { mode: 'lowStock'; threshold: number; page: number };

  function fetchBooks(filters: BookFilters): Promise<PaginatedBooks> {
    const pagination = { page: filters.page, limit: PAGE_SIZE };

    switch (filters.mode) {
      case 'category':
        return searchBooksByCategory(filters.category, pagination);
      case 'lowStock':
        return listLowStockBooks(filters.threshold, pagination);
      default:
        return listBooks(pagination);
    }
  }

  export function useBooks(filters: BookFilters) {
    return useQuery({
      queryKey: ['books', filters],
      queryFn: () => fetchBooks(filters),
      // Keeps the current page on screen while the next one loads, instead of
      // collapsing to the skeleton on every page change.
      placeholderData: keepPreviousData,
    });
  }