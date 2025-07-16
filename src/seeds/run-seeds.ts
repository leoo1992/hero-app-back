import { seedAdmin } from './admin.seed';

async function runSeeds() {
  await seedAdmin();
}

runSeeds().catch((err) => {
  console.error('Erro ao rodar seeds:', err);
});
