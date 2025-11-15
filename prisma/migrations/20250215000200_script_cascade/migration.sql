-- Ensure scripts are deleted automatically when their slide is removed
ALTER TABLE "Script" DROP CONSTRAINT IF EXISTS "Script_slideId_fkey";
ALTER TABLE "Script"
ADD CONSTRAINT "Script_slideId_fkey"
FOREIGN KEY ("slideId") REFERENCES "Slide"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

