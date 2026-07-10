-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "depositoBanco" TEXT,
ADD COLUMN     "depositoNumeroCuenta" TEXT,
ADD COLUMN     "depositoTipoCuenta" TEXT,
ADD COLUMN     "depositoTitular" TEXT;

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" TEXT NOT NULL,
    "banco" TEXT NOT NULL,
    "numeroCuenta" TEXT NOT NULL,
    "tipoCuenta" TEXT NOT NULL DEFAULT '',
    "titular" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BankAccount_active_idx" ON "BankAccount"("active");
