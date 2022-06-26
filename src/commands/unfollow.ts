import { bot } from '../bot';
import { Chat } from '../lib/chat';
import { parseCommandMessage } from '../utils';

export const command = 'unfollow';
export const description = 'Удалить созданную подписку';

export const initialize = () => {
  bot.command(command, async (ctx) => {
    const chat = await Chat.getByUserId(ctx.message.from.id);

    if (!chat.authResult) {
      return ctx.reply(`Необходима авторизация (через полис)`);
    }

    const [lpuCode, departmentId, doctorId] = parseCommandMessage(ctx.message.text);

    if (!lpuCode || !departmentId) {
      return ctx.reply('(Ошибка!) Указанная подписка не найдена. См. /list');
    }

    const doctorsQuery = { departmentId, lpuCode, doctorId };

    try {
      const subscription = await chat.removeSubscription(doctorsQuery);

      return ctx.reply(`Подписка ${subscription.id} успешно удалена`);
    } catch (err) {
      console.error(err);
      return ctx.reply(`(Ошибка!) ${err.message}`);
    }
  });
  bot.action(new RegExp(`^${command}.*$`), async (ctx) => {
    const chat = await Chat.getByUserId(ctx.callbackQuery.from.id);

    if (!chat.authResult) {
      return await ctx.answerCbQuery('Необходима авторизация (через полис)');
    }

    const [lpuCode, departmentId, doctorId] = parseCommandMessage(ctx.match[0]);

    try {
      const subscription = await chat.removeSubscription({ lpuCode, departmentId, doctorId });

      await ctx.editMessageReplyMarkup({
        inline_keyboard: [],
      });

      await ctx.answerCbQuery();

      return await ctx.replyWithMarkdown(`Подписка *${subscription.id}* удалена`);
    } catch (err) {
      return await ctx.answerCbQuery(`(Ошибка!) ${err.message}`);
    }
  });
};
