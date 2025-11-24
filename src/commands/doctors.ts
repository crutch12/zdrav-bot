import { bot } from '../bot';
import { Chat } from '../lib/chat';
import { getDoctors } from '../services/doctors';
import _ from 'lodash';
import { StepMessages } from './start';
import { parseCommandMessage, shortPersonId } from '../utils';
import { Markup } from 'telegraf';
import * as follow from './follow';
import axios from 'axios';

export const command = 'doctors';
export const description = 'Посмотреть список врачей нужной специальности';

const getDoctorsMessages = async (chat: Chat, departmentId: string) => {
  const doctors = await getDoctors(chat, { departmentId });
  const messages = doctors.items.map((item) =>
    [
      `${item.lpu.name}`,
      `Код больницы: *${item.lpu_code}*`,
      `*Список врачей:*`,
      item.doctors.map((doctor) => `(_${shortPersonId(doctor.person_id)}_) ${doctor.displayName}`).join('\n'),
    ].join('\n'),
  );
  const chunks = _.chunk(messages, 7);
  return { chunks, doctors };
};

export const initialize = () => {
  bot.command(command, async (ctx) => {
    const chat = await Chat.getByUserId(ctx.message.from.id);

    if (!chat.authResult) {
      return await ctx.reply('Необходима авторизация (через полис)');
    }

    const [departmentId] = parseCommandMessage(ctx.message.text);

    if (!departmentId) {
      return ctx.reply('(Ошибка!) Нужно указать id специальности врача. См. /departments');
    }

    try {
      const { chunks, doctors } = await getDoctorsMessages(chat, departmentId);

      if (chunks.length === 0) {
        return ctx.replyWithMarkdown(`Не удалось найти врачей для специальности *${departmentId}*`);
      }

      await ctx.replyWithMarkdown(`Список врачей для специальности *${departmentId}*:`);

      await Promise.all(chunks.map((chunk) => ctx.replyWithMarkdown(chunk.join('\n\n'))));

      return ctx.replyWithMarkdown(
        StepMessages.follow(doctors.items[0]?.lpu_code, doctors.items[0]?.doctors[0]?.department),
        {
          ...Markup.inlineKeyboard(
            doctors.items.map((doctor) =>
              Markup.button.callback(
                `Подписаться ${doctor.lpu_code} ${departmentId}`,
                `${follow.command} ${doctor.lpu_code} ${departmentId}`,
              ),
            ),
            {
              columns: 1,
            },
          ),
        },
      );
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        // @ts-expect-error // message unknown
        return ctx.reply(`(Ошибка!) ${err.response?.data?.message || err.message}`);
      }
      return ctx.reply(`(Ошибка!) ${err.message}`);
    }
  });
  bot.action(new RegExp(`^${command}.*$`), async (ctx) => {
    const chat = await Chat.getByUserId(ctx.callbackQuery.from.id);

    if (!chat.authResult) {
      return await ctx.answerCbQuery('Необходима авторизация (через полис)');
    }

    const [departmentId] = parseCommandMessage(ctx.match[0]);

    if (!departmentId) {
      return ctx.reply('(Ошибка!) Нужно указать id специальности врача. См. /departments');
    }

    try {
      const { chunks, doctors } = await getDoctorsMessages(chat, departmentId);

      if (chunks.length === 0) {
        return ctx.answerCbQuery(`Не удалось найти врачей для специальности ${departmentId}`);
      }

      await ctx.answerCbQuery();

      await ctx.replyWithMarkdown(`Список врачей для специальности *${departmentId}*:`);

      await Promise.all(chunks.map((chunk) => ctx.replyWithMarkdown(chunk.join('\n\n'))));

      return ctx.replyWithMarkdown(
        StepMessages.follow(doctors.items[0]?.lpu_code, doctors.items[0]?.doctors[0]?.department),
        {
          ...Markup.inlineKeyboard(
            doctors.items.map((doctor) =>
              Markup.button.callback(
                `Подписаться ${doctor.lpu_code} ${departmentId}`,
                `${follow.command} ${doctor.lpu_code} ${departmentId}`,
              ),
            ),
            {
              columns: 1,
            },
          ),
        },
      );
    } catch (err) {
      console.error(err);
      return ctx.answerCbQuery(`(Ошибка!) ${err.message}`);
    }
  });
};
