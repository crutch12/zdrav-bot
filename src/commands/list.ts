import { bot } from '../bot';
import { Chat, Subscription } from '../lib/chat';
import { Markup } from 'telegraf';
import * as unfollow from './unfollow';

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

      return ctx.replyWithMarkdown(
        'Список активных подписок:\n' + subscriptions.map((sub) => `*${sub.id}*`).join('\n'),
        {
          ...Markup.inlineKeyboard(
            subscriptions.map((subscription) =>
              Markup.button.callback(`Удалить подписку ${subscription.id}`, `${unfollow.command} ${subscription.id}`),
            ),
            {
              columns: 1,
            },
          ),
        },
      );
    } catch (err) {
      console.error(err);
      return ctx.reply(`(Ошибка!) ${err.message}`);
    }
  });
};
