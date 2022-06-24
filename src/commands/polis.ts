import { bot } from '../bot';
import { Chat, Polis } from '../lib/chat';
import { authByPolis } from '../services/auth';
import * as functions from 'firebase-functions';
import { updateChat } from '../db';

export const command = 'polis';
export const description = 'Указать полис и дату рождения (для авторизации)';

export const initialize = () => {
  bot.command(command, async (ctx) => {
    const chat = await Chat.getByUserId(ctx.message.from.id);

    const [polisRaw, birthday] = ctx.message.text.split(' ').slice(1);

    if (!polisRaw || !birthday) {
      return ctx.reply('(Ошибка!) Необходимо ввести полис в формате: номер дата.рождения');
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

    ctx.reply(`Удалось добавить Номер полиса ${polisRaw} и Дату рождения ${birthday}!`);

    ctx.reply('Начинаю аутентификацию на портале госуслуг...');

    try {
      const authResult = await authByPolis(chat);

      await updateChat(chat, {
        authResult,
      });

      const doctor = authResult.items!.doctor;
      return ctx.reply(
        [
          `Аутентификация прошла успешно. ${authResult.message}.`,
          `Ваш personGuid: ${authResult.items!.personGuid}`,
          `Ваш врач: ${[doctor.lastname, doctor.name, doctor.surname].join(' ')}`,
          `Ваша больница: ${doctor.lpu_name} (${doctor.lpu_code})`,
        ].join('\n'),
      );
    } catch (err) {
      functions.logger.error(err);
      return ctx.reply(`(Ошибка!) ${err.message}`);
    }
  });
};
