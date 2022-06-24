import { bot } from '../bot';

export const command = 'start';
export const description = 'Начать';

export const initialize = () => {
  bot.command(command, (ctx) => {
    return ctx.reply('Введите /polist НОМЕР_ПОЛИСА ДАТА_РОЖДЕНИЯ\nНапример /polis 5040200838017611 01.12.2000');
  });
};
