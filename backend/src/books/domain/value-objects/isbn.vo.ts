import { InvalidIsbnError  }   from "../errors/invalid-isbn.error";
 export class Isbn {
    private constructor(readonly value: string) {}
    static create(raw: string): Isbn {
      const normalized = raw.replace(/[\s-]/g, '');
      if (!/^(\d{10}|\d{13})$/.test(normalized)) {
        throw new InvalidIsbnError(raw);
      }
      return new Isbn(normalized);
    }
    equals(other: Isbn): boolean {
      return this.value === other.value;
    }
    toString(): string {
      return this.value;
    }
  }
   