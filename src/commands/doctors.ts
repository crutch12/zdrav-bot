import { bot } from '../bot';
import { Chat } from '../lib/chat';
import { getDoctors } from '../services/doctors';
import _ from 'lodash';
import { StepMessages } from './start';
import { parseCommandMessage, shortPersonId } from '../utils';
import { Context, Markup } from 'telegraf';
import * as follow from './follow';
import axios from 'axios';
import { CommandHandlerParams } from '../types/commands';

export const command = 'doctors';
export const description = 'Посмотреть список врачей нужной специальности';

const getDoctorsMessages = async (chat: Chat, departmentId: string) => {
  const doctors = await getDoctors(chat, { departmentId });
  const messages = doctors.items.map((item) => {
    const message = [
      `🏥 ${item.lpu.name}`,
      `Код больницы: *${item.lpu_code}*`,
      `*Список врачей:*`,
      item.doctors
        .map(
          (doctor) =>
            `- ${doctor.displayName} (${doctor.separation}) (_${shortPersonId(doctor.person_id)}_)\nПодписка: \`/follow ${item.lpu_code} ${departmentId} ${shortPersonId(doctor.person_id)}\``,
        )
        .join('\n'),
    ].join('\n');

    const buttons = item.doctors.map((doctor) => {
      return Markup.button.callback(
        `Подписаться ${_.truncate(item.lpu.name, { length: 15, omission: '.' })} ${doctor.displayName} (${item.lpu_code} - ${shortPersonId(doctor.person_id)})`,
        `${follow.command} ${item.lpu_code} ${departmentId} ${shortPersonId(doctor.person_id)}`,
      );
    });

    return {
      message,
      buttons,
    };
  });
  const chunks = _.chunk(messages, 1);
  return { chunks, doctors };
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
    const { chunks, doctors } = await getDoctorsMessages(chat, departmentId);

    if (chunks.length === 0) {
      return params.answer(`Не удалось найти врачей для специальности ${departmentId}`);
    }

    if (params.answerCb) {
      await params.answerCb();
    }

    await ctx.replyWithMarkdown(`*📋 Список врачей для специальности ${departmentId}*:`);

    await Promise.all(
      chunks.map((chunk) =>
        ctx.replyWithMarkdown(chunk.map((ch) => ch.message).join('\n\n'), {
          ...Markup.inlineKeyboard(
            chunk.flatMap((ch) => ch.buttons),
            {
              columns: 1,
            },
          ),
        }),
      ),
    );

    return ctx.replyWithMarkdown(
      StepMessages.follow(
        doctors.items[0]?.lpu_code,
        doctors.items[0]?.doctors[0]?.department,
        doctors.items[0]?.doctors[0]?.id && shortPersonId(doctors.items[0]?.doctors[0]?.id),
      ),
    );
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
    });
  });
  bot.action(new RegExp(`^${command}.*$`), async (ctx) => {
    return handle(ctx, {
      id: ctx.callbackQuery.from.id,
      text: ctx.match[0],
      answer: ctx.answerCbQuery.bind(ctx),
      answerCb: ctx.answerCbQuery.bind(ctx),
    });
  });
};
