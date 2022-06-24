import { bot } from '../bot';
import { Chat } from '../lib/chat';

export const command = 'unfollow';
export const description =
  'Отписаться от созданной подписки.\nПримеры (код_больницы код_специальности +код_врача):\n/unfollow 0701013 52\nunfollow 0701013 52 a4e5391d-024c-43f2-bd4f-d222b907e549';

export const initialize = () => {
  bot.command(command, async (ctx) => {
    const chat = await Chat.getByUserId(ctx.message.from.id);

    if (!chat.authResult) {
      return ctx.reply(`Необходима авторизация (через полис)`);
    }

    const [lpuCode, departmentRaw, doctorId] = ctx.message.text.split(' ').slice(1);

    const departmentId = Number(departmentRaw);

    if (!lpuCode || Number.isNaN(departmentId)) {
      return ctx.reply('(Ошибка!) Нужно указать КОД_БОЛЬНИЦЫ КОД_СПЕЦИАЛЬНОСТИ +ID_ДОКТОРА. См. /doctors');
    }

    const doctorsQuery = { departmentId, lpuCode, doctorId };

    try {
      await chat.removeSubscription(doctorsQuery);

      return ctx.reply(
        `Произошла отписка от doctorId: ${doctorsQuery.doctorId || '--'}, departmentId: ${
          doctorsQuery.departmentId
        }, lpuCode: ${doctorsQuery.lpuCode}`,
      );
    } catch (err) {
      console.error(err);
      return ctx.reply(`(Ошибка!) ${err.message}`);
    }
  });
};
