-- CreateTable
CREATE TABLE "DiagnosisRequest" (
    "id" SERIAL NOT NULL,
    "consultationId" INTEGER NOT NULL,
    "testName" TEXT NOT NULL,
    "results" TEXT,
    "reportUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiagnosisRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DiagnosisRequest" ADD CONSTRAINT "DiagnosisRequest_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
