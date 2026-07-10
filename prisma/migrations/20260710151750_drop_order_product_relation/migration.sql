-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_productId_fkey";

-- DropIndex
DROP INDEX "Order_productId_idx";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "productId";
