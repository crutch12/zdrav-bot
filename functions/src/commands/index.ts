import * as start from './start';
import * as message from './message';
import * as polis from './polis';

const initializeCommands = () => {
  start.initialize()
  message.initialize()
  polis.initialize()
}

export { initializeCommands };
