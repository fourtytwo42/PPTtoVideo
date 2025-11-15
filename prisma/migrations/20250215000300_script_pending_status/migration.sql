DO $$
BEGIN
  ALTER TYPE "ScriptStatus" ADD VALUE 'PENDING';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;


