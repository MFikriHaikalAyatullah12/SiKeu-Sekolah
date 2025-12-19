/*
  Warnings:

  - The values [LUNAS,MENUNGGU] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [PEMASUKAN,PENGELUARAN] on the enum `TransactionType` will be removed. If these variants are still used in the database, this will fail.
  - The values [BENDAHARA] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `newValues` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `oldValues` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `recordId` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `tableName` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `transactionId` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `color` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `lastResetDate` on the `school_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `logo` on the `school_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `receiptSize` on the `school_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `showQRCode` on the `school_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `signature` on the `school_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `stamp` on the `school_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethodId` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `proof` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `recipientClass` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `recipientName` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the `payment_methods` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `receipts` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name,type,schoolProfileId]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `school_profiles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[receiptNumber]` on the table `transactions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `entityId` to the `audit_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entityType` to the `audit_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolProfileId` to the `audit_logs` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `action` on the `audit_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `userId` on table `audit_logs` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `schoolProfileId` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `categories` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `createdById` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fromTo` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentMethod` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiptNumber` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolProfileId` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'QRIS');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN', 'LOGOUT', 'CREATE_TRANSACTION', 'UPDATE_TRANSACTION', 'DELETE_TRANSACTION');

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentStatus_new" AS ENUM ('PAID', 'PENDING', 'VOID');
ALTER TABLE "transactions" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "transactions" ALTER COLUMN "status" TYPE "PaymentStatus_new" USING ("status"::text::"PaymentStatus_new");
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "PaymentStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TransactionType_new" AS ENUM ('INCOME', 'EXPENSE');
ALTER TABLE "transactions" ALTER COLUMN "type" TYPE "TransactionType_new" USING ("type"::text::"TransactionType_new");
ALTER TYPE "TransactionType" RENAME TO "TransactionType_old";
ALTER TYPE "TransactionType_new" RENAME TO "TransactionType";
DROP TYPE "TransactionType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN', 'TREASURER');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_transactionId_fkey";

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_userId_fkey";

-- DropForeignKey
ALTER TABLE "receipts" DROP CONSTRAINT "receipts_paymentMethodId_fkey";

-- DropForeignKey
ALTER TABLE "receipts" DROP CONSTRAINT "receipts_transactionId_fkey";

-- DropForeignKey
ALTER TABLE "receipts" DROP CONSTRAINT "receipts_userId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_paymentMethodId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_userId_fkey";

-- DropIndex
DROP INDEX "categories_name_key";

-- AlterTable
ALTER TABLE "audit_logs" DROP COLUMN "newValues",
DROP COLUMN "oldValues",
DROP COLUMN "recordId",
DROP COLUMN "tableName",
DROP COLUMN "transactionId",
ADD COLUMN     "details" TEXT,
ADD COLUMN     "entityId" TEXT NOT NULL,
ADD COLUMN     "entityType" TEXT NOT NULL,
ADD COLUMN     "schoolProfileId" TEXT NOT NULL,
DROP COLUMN "action",
ADD COLUMN     "action" "AuditAction" NOT NULL,
ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "color",
ADD COLUMN     "schoolProfileId" TEXT NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "CategoryType" NOT NULL;

-- AlterTable
ALTER TABLE "school_profiles" DROP COLUMN "lastResetDate",
DROP COLUMN "logo",
DROP COLUMN "receiptSize",
DROP COLUMN "showQRCode",
DROP COLUMN "signature",
DROP COLUMN "stamp",
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "signatureUrl" TEXT,
ADD COLUMN     "stampUrl" TEXT,
ALTER COLUMN "receiptFormat" SET DEFAULT 'KW-{YYYY}{MM}-{000}',
ALTER COLUMN "receiptCounter" SET DEFAULT 1;

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "paymentMethodId",
DROP COLUMN "proof",
DROP COLUMN "recipientClass",
DROP COLUMN "recipientName",
DROP COLUMN "userId",
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "fromTo" TEXT NOT NULL,
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL,
ADD COLUMN     "receiptFileUrl" TEXT,
ADD COLUMN     "receiptNumber" TEXT NOT NULL,
ADD COLUMN     "schoolProfileId" TEXT NOT NULL,
ALTER COLUMN "status" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "schoolProfileId" TEXT,
ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'USER';

-- DropTable
DROP TABLE "payment_methods";

-- DropTable
DROP TABLE "receipts";

-- DropEnum
DROP TYPE "ReceiptSize";

-- CreateTable
CREATE TABLE "verificationtokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_token_key" ON "verificationtokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_identifier_token_key" ON "verificationtokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_type_schoolProfileId_key" ON "categories"("name", "type", "schoolProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "school_profiles_email_key" ON "school_profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_receiptNumber_key" ON "transactions"("receiptNumber");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_schoolProfileId_fkey" FOREIGN KEY ("schoolProfileId") REFERENCES "school_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_schoolProfileId_fkey" FOREIGN KEY ("schoolProfileId") REFERENCES "school_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_schoolProfileId_fkey" FOREIGN KEY ("schoolProfileId") REFERENCES "school_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_schoolProfileId_fkey" FOREIGN KEY ("schoolProfileId") REFERENCES "school_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
