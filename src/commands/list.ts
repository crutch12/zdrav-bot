import { bot } from '../bot';
import { Chat, Subscription } from '../lib/chat';

export const command = 'list';
export const description = 'Список активных подписок';

export const initialize = () => {
  bot.command(command, async (ctx) => {
    const chat = await Chat.getByUserId(ctx.message.from.id);

    try {
      const subscriptions: Subscription[] = await chat.getAllSubscriptions().catch((err) => {
        console.info(err);
        return [];
      });

      if (!subscriptions.length) {
        return ctx.reply('Список активных подписок пуст');
      }

      return ctx.reply('Список активных подписок:\n' + subscriptions.map((sub) => sub.id).join('\n'));
    } catch (err) {
      console.error(err);
      return ctx.reply(`(Ошибка!) ${err.message}`);
    }
  });
};
