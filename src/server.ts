import { env } from './config/env';
import app from './app';
import { logger } from './utils/logger';

app.listen(env.PORT, () => {
  logger.info('server', `Listening on port ${env.PORT}`, { env: env.NODE_ENV });
});
