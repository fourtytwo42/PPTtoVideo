-- Add OCR support fields to slides
ALTER TABLE "Slide"
ADD COLUMN "ocrText" TEXT,
ADD COLUMN "needsImageContext" BOOLEAN NOT NULL DEFAULT FALSE;

