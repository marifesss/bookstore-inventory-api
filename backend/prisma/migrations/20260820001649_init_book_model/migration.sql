-- CreateTable
CREATE TABLE "books" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "author" VARCHAR(255) NOT NULL,
    "isbn" VARCHAR(13) NOT NULL,
    "cost_usd" DECIMAL(12,2) NOT NULL,
    "selling_price_local" DECIMAL(12,2),
    "stock_quantity" INTEGER NOT NULL,
    "category" VARCHAR(120) NOT NULL,
    "supplier_country" CHAR(2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "books_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "books_isbn_key" ON "books"("isbn");

-- CreateIndex
CREATE INDEX "books_category_idx" ON "books"("category");

-- CreateIndex
CREATE INDEX "books_stock_quantity_idx" ON "books"("stock_quantity");
