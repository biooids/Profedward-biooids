-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_documentId_fkey";

-- AlterTable
ALTER TABLE "Submission" ALTER COLUMN "documentId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;
