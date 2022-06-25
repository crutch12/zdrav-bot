import { bot } from '../bot';
import { getDoctorsWithSchedule, getFollowMessages, getSchedules } from '../services/doctors';
import { Chat } from '../lib/chat';
import { StepMessages } from './start';
import { parseCommandMessage } from '../utils';

export const command = 'follow';
export const description =
  'Создать подписку на выбранную специальность в конкретной больнице (или на выбранного врача)';

export const initialize = () => {
  bot.command(command, async (ctx) => {
    const chat = await Chat.getByUserId(ctx.message.from.id);

    if (!chat.authResult) {
      return ctx.reply(`Необходима авторизация (через полис)`);
    }

    const [lpuCode, departmentId, doctorId] = parseCommandMessage(ctx.message.text);

    if (!lpuCode || !departmentId) {
      return ctx.reply('(Ошибка!) Нужно указать КОД_БОЛЬНИЦЫ КОД_СПЕЦИАЛЬНОСТИ +ID_ДОКТОРА. См. /doctors');
    }

    const doctorsQuery = { departmentId, lpuCode, doctorId };

    try {
      const doctors = await getDoctorsWithSchedule(chat, doctorsQuery);

      const schedules = getSchedules(doctors);

      const messages = getFollowMessages(schedules);

      await Promise.all(messages.map((message) => ctx.reply(message)));

      const subscription = await chat.subscribeSchedules(getSchedules(doctors, true), doctorsQuery);

      await ctx.replyWithMarkdown(`Подписка *${subscription.id}* успешно создана`);

      return ctx.replyWithMarkdown(StepMessages.unfollow(lpuCode, departmentId));
    } catch (err) {
      console.error(err);
      return ctx.reply(`(Ошибка!) ${err.message}`);
    }
  });
};
