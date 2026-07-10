/*
  Warnings:

  - You are about to drop the column `status` on the `Product` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Product_status_idx";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "email" TEXT;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "status",
ADD COLUMN     "units" INTEGER NOT NULL DEFAULT 1;

-- DropEnum
DROP TYPE "ProductStatus";

-- CreateIndex
CREATE INDEX "Order_productId_idx" ON "Order"("productId");
