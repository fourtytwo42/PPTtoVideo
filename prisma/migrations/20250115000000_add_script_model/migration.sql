-- Add optional per-deck model/voice selections
ALTER TABLE "Deck"
ADD COLUMN "scriptModel" TEXT,
ADD COLUMN "ttsModel" TEXT,
ADD COLUMN "voiceId" TEXT,
ADD COLUMN "voiceLabel" TEXT,
ADD COLUMN "voiceSettings" JSONB;

