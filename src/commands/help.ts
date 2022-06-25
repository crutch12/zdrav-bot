import { bot } from '../bot';
import { START_MESSAGE } from './start';

export const command = 'help';
export const description = 'Помощь';

export const initialize = () => {
  bot.command(command, (ctx) => {
    return ctx.replyWithMarkdown(START_MESSAGE);
  });
};
