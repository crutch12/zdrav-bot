import * as start from './start';
import * as polis from './polis';
import * as follow from './follow';
import * as departments from './departments';
import * as doctors from './doctors';
import * as unfollow from './unfollow';
import * as end from './end';

interface Command {
  command: string;
  description: string;
  initialize: () => void;
}

export const commands: Command[] = [start, end, polis, follow, unfollow, departments, doctors];

const initializeCommands = () => {
  commands.forEach((command) => command.initialize());
};

export { initializeCommands };
