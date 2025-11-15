import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });
loadEnv();

async function main() {
  const deckId = process.argv[2];
  if (!deckId) {
    console.error('Usage: tsx scripts/manual-queue-scripts.ts <deckId>');
    process.exit(1);
  }

  const { prisma } = await import('../lib/prisma');
  const { enqueueJob } = await import('../lib/jobs/queue');

  const deck = await prisma.deck.findUnique({ where: { id: deckId } });
  if (!deck) {
    console.error('Deck not found');
    await prisma.$disconnect();
    process.exit(1);
  }

  const job = await prisma.job.create({
    data: {
      deckId: deck.id,
      ownerId: deck.ownerId,
      type: 'GENERATE_SCRIPTS',
      status: 'QUEUED',
      payload: {},
    },
  });

  await enqueueJob('generate-scripts', { deckId: deck.id, userId: deck.ownerId, jobId: job.id });
  console.log('Queued script job', job.id);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
