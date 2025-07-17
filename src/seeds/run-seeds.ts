import { seedAdmin } from './admin.seed';
import { Logger } from '@nestjs/common';

const logger = new Logger('seed');

async function runSeeds() {
  try {
    await seedAdmin();
    logger.log('Seeds executadas com sucesso.');
  } catch (err) {
    logger.error('Erro ao rodar seeds:', err.stack || err.message);
  }
}

runSeeds();
