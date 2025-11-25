import { bot } from '../bot';
import { DoctorsQuery, getDoctorsWithSchedule, getFollowMessages, getSchedules } from '../services/doctors';
import { Chat } from '../lib/chat';
import { parseCommandMessage } from '../utils';
import { Markup } from 'telegraf';
import * as unfollow from './unfollow';
import axios from 'axios';
import { Context } from 'telegraf';
import { CommandHandlerParams } from '../types/commands';

export const command = 'follow';
export const description =
  'Создать подписку на выбранную специальность в конкретной больнице (или на выбранного врача)';

const generateFollowMessages = async (chat: Chat, doctorsQuery: DoctorsQuery) => {
  const doctors = await getDoctorsWithSchedule(chat, doctorsQuery);

  const schedules = getSchedules(doctors);

  const messages = getFollowMessages(schedules);

  const subscription = await chat.subscribeSchedules(getSchedules(doctors, true), doctorsQuery);

  return {
    subscription,
    messages,
  };
};

const handle = async (ctx: Context, params: CommandHandlerParams) => {
  const chat = await Chat.getByUserId(params.id);

  if (!chat.authResult) {
    return await params.answer('Необходима авторизация (через полис)');
  }

  const [lpuCode, departmentId, doctorId] = parseCommandMessage(params.text);

  if (!lpuCode || !departmentId) {
    return params.answer('(Ошибка!) Нужно указать КОД_БОЛЬНИЦЫ КОД_СПЕЦИАЛЬНОСТИ +ID_ДОКТОРА. См. /doctors');
  }

  const doctorsQuery = { departmentId, lpuCode, doctorId };

  try {
    await ctx.replyWithMarkdown(`Создаём подписку *${Chat.getSubscriptionKey(doctorsQuery)}*`);

    const { messages, subscription } = await generateFollowMessages(chat, doctorsQuery);

    if (params.answerCb) {
      await params.answerCb();
    }

    await Promise.all(messages.map((message) => ctx.replyWithMarkdown(message)));

    return await ctx.replyWithMarkdown(`Подписка *${subscription.id}* успешно создана`, {
      ...Markup.inlineKeyboard([
        Markup.button.callback(`Удалить подписку ${subscription.id}`, `${unfollow.command} ${subscription.id}`),
      ]),
    });
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
