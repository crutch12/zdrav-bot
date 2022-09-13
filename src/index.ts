import http from 'http';
import { initializeCommands } from './commands';

initializeCommands();

const host = process.env.HOST || 'localhost';
const port = Number(process.env.PORT || 3000);

console.log('start server', host, port);

const server = new http.Server((req, res) => {
  console.log(req.method, req.url, new Date());
  res.end('Hello world!');
});

server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
