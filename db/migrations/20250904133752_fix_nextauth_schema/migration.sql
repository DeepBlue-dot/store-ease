-- DropIndex
DROP INDEX "public"."VerificationToken_token_key";

-- AlterTable
ALTER TABLE "public"."Account" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."Session" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."VerificationToken" ADD CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier", "token");

-- DropIndex
DROP INDEX "public"."VerificationToken_identifier_token_key";
