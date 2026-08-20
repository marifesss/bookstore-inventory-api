 import { DomainError } from './domain.error';
  export class DuplicateIsbnError extends DomainError {
    readonly code = 'DUPLICATE_ISBN';
    constructor(isbn: string) {
      super(`A book with ISBN ${isbn} already exists`);
    }
  }