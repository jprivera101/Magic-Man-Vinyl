import "server-only";
import { prisma } from "@/lib/prisma";
import type { BankAccountInput } from "@/lib/validation";

export async function getActiveBankAccounts() {
  return prisma.bankAccount.findMany({
    where: { active: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getAllBankAccounts() {
  return prisma.bankAccount.findMany({
    orderBy: [{ active: "desc" }, { createdAt: "asc" }],
  });
}

export async function getBankAccountById(id: string) {
  return prisma.bankAccount.findUnique({ where: { id } });
}

export async function createBankAccount(data: BankAccountInput) {
  return prisma.bankAccount.create({ data });
}

export async function updateBankAccount(id: string, data: BankAccountInput) {
  return prisma.bankAccount.update({ where: { id }, data });
}

export async function setBankAccountActive(id: string, active: boolean) {
  return prisma.bankAccount.update({ where: { id }, data: { active } });
}
