import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });
loadEnv();

if (!process.env.REDIS_URL) {
  console.warn("REDIS_URL not set after loading .env.local");
}

async function main() {
  const { prisma } = await import("../lib/prisma");
  const { enqueueJob } = await import("../lib/jobs/queue");

  const deckId = process.argv[2];
  if (!deckId) {
    console.error("Usage: tsx scripts/manual-enqueue.ts <deckId>");
    process.exit(1);
  }

  const deck = await prisma.deck.findUnique({ where: { id: deckId } });
  if (!deck) {
    console.error(`Deck ${deckId} not found`);
    process.exit(1);
  }

  const job = await prisma.job.create({
    data: {
      deckId: deck.id,
      ownerId: deck.ownerId,
      type: "INGEST_DECK",
      status: "QUEUED",
      payload: {},
    },
  });

  await enqueueJob("ingest-deck", { deckId: deck.id, userId: deck.ownerId, jobId: job.id });
  console.log(`Queued ingestion job ${job.id} for deck ${deck.title}`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

