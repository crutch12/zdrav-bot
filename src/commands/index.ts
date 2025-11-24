import * as start from './start';
import * as polis from './polis';
import * as follow from './follow';
import * as departments from './departments';
import * as doctors from './doctors';
import * as unfollow from './unfollow';
import * as end from './end';
import * as help from './help';
import * as list from './list';
import * as me from './me';

interface Command {
  command: string;
  description: string;
  initialize: () => void;
}

export const commands: Command[] = [start, help, polis, departments, doctors, follow, list, unfollow, end, me];

const initializeCommands = () => {
  commands.forEach((command) => command.initialize());
};

export { initializeCommands };
