-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "rejectionReason" TEXT,
ALTER COLUMN "telefono" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "sku" TEXT;

-- CreateTable
CREATE TABLE "PriceLog" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "productId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PriceLog_sku_idx" ON "PriceLog"("sku");

-- CreateIndex
CREATE INDEX "Product_sku_idx" ON "Product"("sku");
