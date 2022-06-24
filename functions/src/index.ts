import { initializeCommands } from './commands';

initializeCommands();

export { echoBot } from './bot';

export default (req, res) => {
  res.end('Welcome to Micro');
};
