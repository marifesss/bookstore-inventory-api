import { DomainError } from './domain.error';
  export class BookNotFoundError extends DomainError {
    readonly code = 'BOOK_NOT_FOUND';
    constructor(id: number) {
      super(`Book with id ${id} was not found`);
    }
  }