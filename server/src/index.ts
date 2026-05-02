import 'dotenv/config';
import './config'; // validate env first
import './types';
import { createApp } from './app';
import { config } from './config';
import { logger } from './logger';

const app = createApp();

app.listen(config.PORT, () => {
  logger.info(`StudyLog API listening on port ${config.PORT} [${config.NODE_ENV}]`);
});
