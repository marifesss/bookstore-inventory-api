import { useMutation, useQueryClient } from '@tanstack/react-query';

  import {
    calculateSellingPrice,
    createBook,
    deleteBook,
    updateBook,
  } from '../../../api/books.api';
  import type { BookPayload } from '../../../types/book';

  function useBooksInvalidation() {
    const queryClient = useQueryClient();

    return () => queryClient.invalidateQueries({ queryKey: ['books'] });
  }

  export function useCreateBook() {
    const invalidate = useBooksInvalidation();

    return useMutation({ mutationFn: createBook, onSuccess: invalidate });
  }

  export function useUpdateBook() {
    const invalidate = useBooksInvalidation();

    return useMutation({
      mutationFn: ({ id, payload }: { id: number; payload: BookPayload }) =>
        updateBook(id, payload),
      onSuccess: invalidate,
    });
  }

  export function useDeleteBook() {
    const invalidate = useBooksInvalidation();

    return useMutation({ mutationFn: deleteBook, onSuccess: invalidate });
  }

  export function useCalculatePrice() {
    const invalidate = useBooksInvalidation();

    return useMutation({ mutationFn: calculateSellingPrice, onSuccess: invalidate });
  }