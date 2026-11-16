import { seedAdmin } from './admin.seed';
import { Logger } from '@nestjs/common';

const logger = new Logger('seed');

async function runSeeds() {
  try {
    await seedAdmin();
    logger.log('Seeds executed successfully.');
  } catch (error) {
    logger.error(
      'Seed execution failed.',
      error instanceof Error ? error.stack : String(error),
    );
    process.exitCode = 1;
  }
}

void runSeeds();
