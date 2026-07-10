-- CreateTable
CREATE TABLE "SkuCounter" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "lastSku" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SkuCounter_pkey" PRIMARY KEY ("id")
);
