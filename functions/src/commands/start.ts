import { bot } from '../bot';

export const initialize = () => {
  // initialize the commands
  bot.command('start', (ctx) => ctx.reply("Hello! Send any message and I will copy it."))
  // bot.command(['asd', 'wtf', 'wtf2'], ctx => ctx.reply('wtf'));
};
