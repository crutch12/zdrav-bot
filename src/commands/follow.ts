import { bot } from '../bot';
import { getDoctorsWithSchedule, getFollowMessages, getSchedules } from '../services/doctors';
import * as functions from 'firebase-functions';
import { Chat } from '../lib/chat';

export const command = 'follow';
export const description =
  'Подписаться на выбранную специальность в конкретной больнице (или на выбранного врача).\nПримеры (код_больницы код_специальности +код_врача):\n/follow 0701013 52\nfollow 0701013 52 a4e5391d-024c-43f2-bd4f-d222b907e549';

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
      const doctors = await getDoctorsWithSchedule(chat, doctorsQuery);

      const schedules = getSchedules(doctors);

      await chat.setSchedules(schedules, doctorsQuery);

      const messages = getFollowMessages(schedules);

      return Promise.all(messages.map((message) => ctx.reply(message)));
    } catch (err) {
      functions.logger.error(err);
      return ctx.reply(`(Ошибка!) ${err.message}`);
    }
  });
};
