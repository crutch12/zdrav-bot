import { bot } from '../bot';
import { removeChat } from '../db';
import * as functions from 'firebase-functions';

export const command = 'end';
export const description = 'Закончить (удалить все данные и подписки)';

export const initialize = () => {
  bot.command(command, async (ctx) => {
    try {
      await removeChat(ctx.message.from.id);
      return ctx.reply('Все данные и подписки успешно удалены.');
    } catch (err) {
      functions.logger.error(err);
      return ctx.reply(`(Ошибка!) ${err.message}`);
    }
  });
};
