import { bot } from '../bot';
import { Chat, Polis } from '../lib/chat';
import { authByPolis, getInitialSessionCookie } from '../services/auth';
import { updateChat } from '../db';
import { StepMessages } from './start';
import { parseCommandMessage } from '../utils';

export const command = 'polis';
export const description = 'Указать полис и дату рождения (для авторизации)';

export const initialize = () => {
  bot.command(command, async (ctx) => {
    const chat = await Chat.getByUserId(ctx.message.from.id);

    const [polisRaw, birthday] = parseCommandMessage(ctx.message.text);

    if (!polisRaw || !birthday) {
      return ctx.replyWithMarkdown('(Ошибка!) Необходимо ввести полис в формате\n: *5040200838017611 01.12.2000*');
    }

    const polis: Polis = {
      birthday: birthday,
      // nPol: polis,
      nPol: null,
      pol: polisRaw,
      // sPol: polis,
      sPol: null,
      auth: false,
    };

    await updateChat(chat, {
      polis,
    });

    await ctx.replyWithMarkdown(`Удалось добавить Номер полиса (*${polisRaw}*) и Дату рождения (*${birthday}*)`);

    await ctx.reply('Начинаем аутентификацию на портале госуслуг...');

    try {
      const initialCookies = await getInitialSessionCookie(chat);
      const authResult = await authByPolis(chat);

      await updateChat(chat, {
        authResult,
        initialCookies,
      });

      const doctor = authResult.items!.doctor;
      await ctx.replyWithMarkdown(
        [
          `Аутентификация прошла успешно. ${authResult.message}.`,
          `Ваш personGuid: ${authResult.items!.personGuid}`,
          `Ваш врач: ${[doctor.lastname, doctor.name, doctor.surname].join(' ')}`,
          `Ваша больница: ${doctor.lpu_name}`,
          `Код больницы: *${doctor.lpu_code}*`,
        ].join('\n'),
      );

      return ctx.replyWithMarkdown(StepMessages.departments);
    } catch (err) {
      console.error(err);
      return ctx.reply(`(Ошибка!) ${err.message}`);
    }
  });
};
