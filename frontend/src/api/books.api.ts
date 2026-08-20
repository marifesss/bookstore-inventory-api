 import { api } from './client';
  import type {
    Book,
    BookPayload,
    PaginatedBooks,
    PriceBreakdown,
  } from '../types/book';

  export interface PageQuery {
    page?: number;
    limit?: number;
  }

  export async function listBooks(query: PageQuery = {}): Promise<PaginatedBooks> {
    const { data } = await api.get<PaginatedBooks>('/books', { params: query });

    return data;
  }

  export async function searchBooksByCategory(
    category: string,
    query: PageQuery = {},
  ): Promise<PaginatedBooks> {
    const { data } = await api.get<PaginatedBooks>('/books/search', {
      params: { category, ...query },
    });

    return data;
  }

  export async function listLowStockBooks(
    threshold: number,
    query: PageQuery = {},
  ): Promise<PaginatedBooks> {
    const { data } = await api.get<PaginatedBooks>('/books/low-stock', {
      params: { threshold, ...query },
    });

    return data;
  }

  export async function getBook(id: number): Promise<Book> {
    const { data } = await api.get<Book>(`/books/${id}`);

    return data;
  }

  export async function createBook(payload: BookPayload): Promise<Book> {
    const { data } = await api.post<Book>('/books', payload);

    return data;
  }

  export async function updateBook(id: number, payload: BookPayload): Promise<Book> {
    const { data } = await api.put<Book>(`/books/${id}`, payload);

    return data;
  }

  export async function deleteBook(id: number): Promise<void> {
    await api.delete(`/books/${id}`);
  }

  export async function calculateSellingPrice(id: number): Promise<PriceBreakdown> {
    const { data } = await api.post<PriceBreakdown>(`/books/${id}/calculate-price`);

    return data;
  }
