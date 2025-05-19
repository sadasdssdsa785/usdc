import { Elysia } from 'elysia';
import { readFile } from 'fs/promises';
import { join } from 'path';

const app = new Elysia()
  .get('/', () => 'Bot is running')
  .get('/wallets/unichain', async () => {
    try {
      const data = await readFile('unichain_wallets.json', 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return { wallets: [] };
    }
  })
  .get('/wallets/base', async () => {
    try {
      const data = await readFile('base_wallets.json', 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return { wallets: [] };
    }
  })
  .listen(process.env.PORT || 3000);

console.log(`🦊 Server is running at ${app.server?.hostname}:${app.server?.port}`); 