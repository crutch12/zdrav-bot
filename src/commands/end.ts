import { bot } from '../bot';
import { removeChat } from '../db';

export const command = 'end';
export const description = 'Закончить (удалить введённые данные и подписки)';

export const initialize = () => {
  bot.command(command, async (ctx) => {
    try {
      await removeChat(ctx.message.from.id);
      return ctx.reply('Все введённые данные и подписки успешно удалены');
    } catch (err) {
      console.error(err);
      return ctx.reply(`(Ошибка!) ${err.message}`);
    }
  });
};
