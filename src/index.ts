import { commands, initializeCommands } from './commands';
import serve, { json } from 'micro';
import { bot, echoBot } from './bot';
import { run } from './lib/cron';

initializeCommands();

const host = process.env.HOST || 'localhost';
const port = Number(process.env.PORT || 3000);

console.log('start server', host, port);

bot.launch({
  webhook: {
    domain: process.env.TELEGRAM_DOMAIN,
  },
});

const server = serve(async (req, res) => {
  bot.telegram.setMyCommands(commands);

  if (req.url === '/cron') {
    return run(bot).catch((err) => {
      console.error(err);
      return 'fail';
    });
  }

  const body = req.method === 'POST' ? await json(req) : null;

  console.log(req.method, req.url, body, new Date());

  if (body) {
    return echoBot(body, res);
  }

  return 'Hello world';
});

// @ts-ignore // Типы врут
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
