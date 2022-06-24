import { initializeCommands } from './commands';

initializeCommands();

export default (req, res) => {
  res.end('Welcome to Micro');
};
