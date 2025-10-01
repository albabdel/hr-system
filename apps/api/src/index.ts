import 'dotenv/config.js';
import { createApp } from './app.js';
import { env } from './env.js';

const { boot } = createApp();
const port = env.PORT || 3000;

boot(port).catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
