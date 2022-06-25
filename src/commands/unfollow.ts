import { bot } from '../bot';
import { Chat } from '../lib/chat';

export const command = 'unfollow';
export const description = 'Удалить созданную подписку';

export const initialize = () => {
  bot.command(command, async (ctx) => {
    const chat = await Chat.getByUserId(ctx.message.from.id);

    if (!chat.authResult) {
      return ctx.reply(`Необходима авторизация (через полис)`);
    }

    const [lpuCode, departmentId, doctorId] = ctx.message.text.split(/\s+/).slice(1);

    if (!lpuCode || !departmentId) {
      return ctx.reply('(Ошибка!) Нужно указать КОД_БОЛЬНИЦЫ КОД_СПЕЦИАЛЬНОСТИ +ID_ДОКТОРА. См. /doctors');
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
};
