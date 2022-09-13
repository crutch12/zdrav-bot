import { initializeCommands } from './commands';
import serve, { json } from 'micro';
import { echoBot } from './bot';

initializeCommands();

const host = process.env.HOST || 'localhost';
const port = Number(process.env.PORT || 3000);

console.log('start server', host, port);

const server = serve(async (req, res) => {
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
