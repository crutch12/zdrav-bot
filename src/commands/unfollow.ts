import axios from 'axios';
import { bot } from '../bot';
import { Chat } from '../lib/chat';
import { parseCommandMessage } from '../utils';
import { Context } from 'telegraf';
import { CommandHandlerParams } from '../types/commands';

export const command = 'unfollow';
export const description = 'Удалить созданную подписку';

const handle = async (ctx: Context, params: CommandHandlerParams) => {
  const chat = await Chat.getByUserId(params.id);

  if (!chat.authResult) {
    return await params.answer('Необходима авторизация (через полис)');
  }

  const [lpuCode, departmentId, doctorId] = parseCommandMessage(params.text);

  try {
    const subscription = await chat.removeSubscription({ lpuCode, departmentId, doctorId });

    await ctx.editMessageReplyMarkup({
      inline_keyboard: [],
    });

    if (params.answerCb) {
      await params.answerCb();
    }

    return await ctx.replyWithMarkdown(`Подписка *${subscription.id}* успешно удалена`);
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
