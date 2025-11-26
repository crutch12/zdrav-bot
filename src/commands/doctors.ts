import { bot } from '../bot';
import { Chat } from '../lib/chat';
import { getDoctors } from '../services/doctors';
import _ from 'lodash';
import { StepMessages } from './start';
import { parseCommandMessage, shortId } from '../utils';
import { Context, Markup } from 'telegraf';
import * as follow from './follow';
import axios from 'axios';
import { CommandHandlerParams } from '../types/commands';
import * as hospitalsCommand from './hospitals';

export const command = 'doctors';
export const description = 'Посмотреть список врачей нужной специальности';

const getDoctorsMessages = async (chat: Chat, departmentId: string, lpuCode?: string) => {
  const doctors = await getDoctors(chat, { departmentId });

  if (lpuCode) {
    doctors.items = doctors.items.filter((item) => item.lpu_code === lpuCode);
  }

  const messages = doctors.items.map((item) => {
    const message = [
      `🏥 ${item.lpu.name}`,
      `Код больницы: *${item.lpu_code}*`,
      `*Список врачей/кабинетов:*`,
      item.doctors
        .map(
          (doctor) =>
            `- ${doctor.person_id ? '🧑‍⚕️' : '🩺'} ${doctor.displayName} (${doctor.separation}) (\`${shortId(doctor.id)}\`)`,
        )
        .join('\n'),
    ].join('\n');

    const buttons = item.doctors.map((doctor) => {
      return Markup.button.callback(
        `${doctor.person_id ? '🧑‍⚕️' : '🩺'} ${_.truncate(doctor.displayName, { length: 25, omission: '.' })} (${item.lpu_code} - ${shortId(doctor.id)})`,
        `${follow.command} ${item.lpu_code} ${departmentId} ${shortId(doctor.id)}`,
      );
    });

    return {
      message,
      buttons,
    };
  });
  const chunks = _.chunk(messages, 10);
  return { chunks, doctors };
};

const handle = async (ctx: Context, params: CommandHandlerParams) => {
  const chat = await Chat.getByUserId(params.id);

  if (!chat.authResult) {
    return await params.answer('Необходима авторизация (через полис)');
  }

  const [departmentId, lpuCode] = parseCommandMessage(params.text);

  if (!departmentId) {
    return params.answer('(Ошибка!) Нужно указать id специальности врача. См. /departments');
  }

  try {
    const { chunks, doctors } = await getDoctorsMessages(chat, departmentId, lpuCode);

    if (chunks.length === 0) {
      return params.answer(`Не удалось найти врачей для специальности ${departmentId} и больницы ${lpuCode}`);
    }

    if (params.answerCb) {
      await params.answerCb();
    }

    for (const chunk of chunks) {
      let message = chunk.map((ch) => ch.message).join('\n\n');
      const idx = chunks.indexOf(chunk);
      const [isFirts, isLast] = [idx === 0, idx === chunks.length - 1];
      if (isFirts) {
        message = [
          `*📋 Список врачей/кабинетов для специальности ${departmentId} и больницы ${lpuCode}*:`,
          message,
        ].join('\n\n');
      }
      if (isLast) {
        message = [
          message,
          StepMessages.follow(
            doctors.items[0]?.lpu_code,
            doctors.items[0]?.doctors[0]?.department,
            doctors.items[0]?.doctors[0]?.id && shortId(doctors.items[0]?.doctors[0]?.id),
          ),
        ].join('\n\n');
      }
      const reply = isLast ? params.answerWithMarkdown.bind(ctx) : ctx.replyWithMarkdown;
      await reply(message, {
        ...Markup.inlineKeyboard(
          [
            ...chunk.flatMap((ch) => ch.buttons),
            isLast ? Markup.button.callback(`Назад`, `${hospitalsCommand.command} ${departmentId}`) : [],
          ].flat(),
          {
            columns: 1,
          },
        ),
      });
    }
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      // @ts-expect-error // message unknown
      return params.answer(`(Ошибка!) ${err.response?.data?.message || err.message}`);
    }
    return params.answer(`(Ошибка!) ${err.message}`);
  }
};

export const initialize = () => {
  bot.command(command, async (ctx) => {
    return handle(ctx, {
      id: ctx.message.from.id,
      text: ctx.message.text,
      answer: ctx.reply.bind(ctx),
      answerWithMarkdown: ctx.replyWithMarkdown.bind(ctx),
    });
  });
  bot.action(new RegExp(`^${command}.*$`), async (ctx) => {
    return handle(ctx, {
      id: ctx.callbackQuery.from.id,
      text: ctx.match[0],
      answer: ctx.answerCbQuery.bind(ctx),
      answerCb: ctx.answerCbQuery.bind(ctx),
      answerWithMarkdown: (text, extra) => ctx.editMessageText.bind(ctx)(text, { parse_mode: 'Markdown', ...extra }),
    });
  });
};
