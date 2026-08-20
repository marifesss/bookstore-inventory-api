import { DomainError } from './domain.error';
  export class InvalidIsbnError extends DomainError {
    readonly code = 'INVALID_ISBN';
    constructor(rawIsbn: string) {
      super(`"${rawIsbn}" is not a valid ISBN: expected 10 or 13 digits`);
    }
  }