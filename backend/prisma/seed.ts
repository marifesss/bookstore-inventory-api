import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * ISBNs are stored normalized (digits only), exactly as the API persists them:
 * the column is VarChar(13), so a hyphenated value would not even fit.
 * Money is written as a string so no float rounding happens on the way in.
 */
const books: Prisma.BookCreateManyInput[] = [
  // --- Literatura Clásica ---
  {
    title: 'El Quijote',
    author: 'Miguel de Cervantes',
    isbn: '9788437604947',
    costUsd: '15.99',
    sellingPriceLocal: '19.03', // already priced: 15.99 * 0.85 * 1.4
    stockQuantity: 25,
    category: 'Literatura Clásica',
    supplierCountry: 'ES',
  },
  {
    title: 'Cien años de soledad',
    author: 'Gabriel García Márquez',
    isbn: '9788497592208',
    costUsd: '18.50',
    stockQuantity: 12,
    category: 'Literatura Clásica',
    supplierCountry: 'CO',
  },
  {
    title: 'La Odisea',
    author: 'Homero',
    isbn: '9788424116347',
    costUsd: '14.25',
    stockQuantity: 4, // low stock
    category: 'Literatura Clásica',
    supplierCountry: 'GR',
  },

  // --- Ciencia Ficción ---
  {
    title: 'Dune',
    author: 'Frank Herbert',
    isbn: '9780441013593',
    costUsd: '22.00',
    sellingPriceLocal: '26.18', // already priced: 22.00 * 0.85 * 1.4
    stockQuantity: 30,
    category: 'Ciencia Ficción',
    supplierCountry: 'US',
  },
  {
    title: 'Fundación',
    author: 'Isaac Asimov',
    isbn: '9788497596541',
    costUsd: '16.75',
    stockQuantity: 8, // low stock
    category: 'Ciencia Ficción',
    supplierCountry: 'US',
  },
  {
    title: 'Neuromante',
    author: 'William Gibson',
    isbn: '9788445074879',
    costUsd: '19.90',
    stockQuantity: 15,
    category: 'Ciencia Ficción',
    supplierCountry: 'US',
  },

  // --- Historia ---
  {
    title: 'Sapiens: De animales a dioses',
    author: 'Yuval Noah Harari',
    isbn: '9788499926223',
    costUsd: '24.99',
    stockQuantity: 40,
    category: 'Historia',
    supplierCountry: 'IL',
  },
  {
    title: 'SPQR: Una historia de la antigua Roma',
    author: 'Mary Beard',
    isbn: '9788498929386',
    costUsd: '27.50',
    stockQuantity: 2, // low stock
    category: 'Historia',
    supplierCountry: 'GB',
  },

  // --- Tecnología ---
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '9780132350884',
    costUsd: '45.99',
    stockQuantity: 18,
    category: 'Tecnología',
    supplierCountry: 'US',
  },
  {
    title: 'Domain-Driven Design',
    author: 'Eric Evans',
    isbn: '9780321125217',
    costUsd: '54.00',
    stockQuantity: 6, // low stock
    category: 'Tecnología',
    supplierCountry: 'US',
  },

  // --- Poesía ---
  {
    title: 'Veinte poemas de amor y una canción desesperada',
    author: 'Pablo Neruda',
    isbn: '9788497931175',
    costUsd: '11.50',
    stockQuantity: 22,
    category: 'Poesía',
    supplierCountry: 'CL',
  },
  {
    title: 'Antología poética',
    author: 'Federico García Lorca',
    isbn: '9788420674827',
    costUsd: '13.80',
    stockQuantity: 9, // low stock
    category: 'Poesía',
    supplierCountry: 'ES',
  },
];

const LOW_STOCK_THRESHOLD = 10;

async function main(): Promise<void> {
  // A seed leaves a known state, so it wipes first and can be re-run at will.
  const { count: removed } = await prisma.book.deleteMany();
  const { count: inserted } = await prisma.book.createMany({ data: books });

  const categories = [...new Set(books.map((book) => book.category))].sort();
  const lowStock = books.filter((book) => book.stockQuantity < LOW_STOCK_THRESHOLD);

  console.log(`Removed ${removed} book(s), inserted ${inserted}.`);
  console.log(`Categories (${categories.length}): ${categories.join(', ')}`);
  console.log(
    `Below ${LOW_STOCK_THRESHOLD} in stock (${lowStock.length}): ` +
      lowStock.map((book) => `${book.title} (${book.stockQuantity})`).join(', '),
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
