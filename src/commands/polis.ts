import { bot } from '../bot';
import { Chat, Polis } from '../lib/chat';
import { authByPolis } from '../services/auth';
import { updateChat } from '../db';
import { StepMessages } from './start';
import { parseCommandMessage } from '../utils';
import axios from 'axios';

export const command = 'polis';
export const description = 'Указать полис и дату рождения (для авторизации)';

export const initialize = () => {
  bot.command(command, async (ctx) => {
    const chat = await Chat.getByUserId(ctx.message.from.id);

    const parsed = parseCommandMessage(ctx.message.text);

    const polisRaw = parsed
      .slice(0, parsed.length - 1)
      .join('')
      .replace(/-/g, '');
    const birthday = parsed[parsed.length - 1];

    if (!polisRaw || !birthday || !birthday.match(/\d\d\.\d\d\.\d\d\d\d/)) {
      return ctx.replyWithMarkdown(
        [
          'Для указания полиса необходимо ввести номер полиса/свидетельства и дату рождения в любом из форматов:',
          '',
          '*Нового образца*',
          '/polis 5040 2008 3801 7611 01.12.2000',
          '',
          '*Старого образца*',
          '/polis 10-10 123789 01.12.2000',
          '',
          '*Временное свидетельство*',
          '/polis 111 3334444 01.12.2000',
          '',
          'Лишние пробелы и дефисы игнорируются',
        ].join('\n'),
      );
    }

    const polis: Polis = {
      birthday: birthday,
      number: polisRaw,
    };

    await updateChat(chat, {
      polis,
    });

    await ctx.replyWithMarkdown(`Удалось сохранить Номер полиса (*${polisRaw}*) и Дату рождения (*${birthday}*)`);

    await ctx.reply('Начинаем аутентификацию на портале госуслуг...');

    try {
      const authResult = await authByPolis(chat);

      await updateChat(chat, {
        authResult,
      });

      const doctor = authResult.doctor;
      await ctx.replyWithMarkdown(
        [
          `Аутентификация прошла успешно.`,
          `Ваш personGuid: \`${authResult.personGuid}\``,
          `Ваш врач: ${doctor ? [doctor.lastname, doctor.name, doctor.surname].join(' ') : '(нет)'}`,
          ...(doctor ? [`Ваша больница: ${doctor.lpu_name}`, `Код больницы: *${doctor.lpu_code}*`] : []),
        ].join('\n'),
      );

      return ctx.replyWithMarkdown(StepMessages.departments);
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        // @ts-expect-error // message unknown
        return ctx.reply(`(Ошибка!) ${err.response?.data?.message || err.message}`);
      }
      return ctx.reply(`(Ошибка!) ${err.message}`);
    }
  });
};
