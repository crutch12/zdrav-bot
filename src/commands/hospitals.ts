import { bot } from '../bot';
import { Chat } from '../lib/chat';
import { getDoctors } from '../services/doctors';
import _ from 'lodash';
import { StepMessages } from './start';
import { parseCommandMessage } from '../utils';
import { Context, Markup } from 'telegraf';
import * as doctorsCommand from './doctors';
import * as departmentsCommand from './departments';
import axios from 'axios';
import { CommandHandlerParams } from '../types/commands';

export const command = 'hospitals';
export const description = 'Посмотреть список больниц для нужной специальности';

const getHospitalsMessages = async (chat: Chat, departmentId: string) => {
  const doctors = await getDoctors(chat, { departmentId });
  const hospitals = _.uniqBy(
    doctors.items.map((item) => item.lpu),
    (x) => x.mcod,
  );
  const messages = hospitals.map((lpu) => {
    const message = [`🏥 ${lpu.name}`, `Код больницы: *${lpu.mcod}*`].join('\n');

    const buttons = [
      Markup.button.callback(
        `${_.truncate(lpu.name, { length: 25, omission: '.' })} (${lpu.mcod})`,
        `${doctorsCommand.command} ${departmentId} ${lpu.mcod}`,
      ),
    ];

    return {
      message,
      buttons,
    };
  });
  const chunks = _.chunk(messages, 10);
  return { chunks, hospitals };
};

const handle = async (ctx: Context, params: CommandHandlerParams) => {
  const chat = await Chat.getByUserId(params.id);

  if (!chat.authResult) {
    return await params.answer('Необходима авторизация (через полис)');
  }

  const [departmentId] = parseCommandMessage(params.text);

  if (!departmentId) {
    return params.answer('(Ошибка!) Нужно указать id специальности врача. См. /departments');
  }

  try {
    const { chunks, hospitals } = await getHospitalsMessages(chat, departmentId);

    if (chunks.length === 0) {
      return params.answer(`Не удалось найти больницы для специальности ${departmentId}`);
    }

    if (params.answerCb) {
      await params.answerCb();
    }

    for (const chunk of chunks) {
      let message = chunk.map((ch) => ch.message).join('\n\n');
      const idx = chunks.indexOf(chunk);
      const [isFirts, isLast] = [idx === 0, idx === chunks.length - 1];
      if (isFirts) {
        message = [`*📋 Список больниц для специальности ${departmentId}*:`, message].join('\n\n');
      }
      if (isLast) {
        message = [message, StepMessages.hospitals(hospitals[0]?.mcod, departmentId)].join('\n\n');
      }
      const reply = isLast ? params.answerWithMarkdown.bind(ctx) : ctx.replyWithMarkdown;
      await reply(message, {
        ...Markup.inlineKeyboard(
          [
            ...chunk.flatMap((ch) => ch.buttons),
            isLast ? Markup.button.callback(`Назад`, `${departmentsCommand.command}`) : [],
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
