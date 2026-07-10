-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "depositoPath" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isCustom" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "percent" INTEGER NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Promotion_productId_idx" ON "Promotion"("productId");

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
