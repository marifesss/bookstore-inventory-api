 import { DomainError } from './domain.error';
  export class InvalidBookDataError extends DomainError {
    readonly code = 'INVALID_BOOK_DATA';
    constructor(message: string) {
      super(message);
    }
  }