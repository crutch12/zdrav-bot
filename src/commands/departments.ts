import { bot } from '../bot';
import { getDepartments } from '../services/departments';
import { Chat } from '../lib/chat';
import _ from 'lodash';
import { StepMessages } from './start';
import { Context, Markup } from 'telegraf';
import * as hospitals from './hospitals';
import axios from 'axios';
import { CommandHandlerParams } from '../types/commands';

export const command = 'departments';
export const description = 'Посмотреть список доступных специальностей';

const getDepartmentsMessages = async (chat: Chat) => {
  const departments = await getDepartments(chat);

  const messages = departments.items.map((item) => {
    const message = `\`${item.code}\` - ${item.title.slice(0, 60)}`;

    const buttons = [
      Markup.button.callback(
        `${item.code} (${_.truncate(item.title, { length: 15, omission: '.' })})`,
        `${hospitals.command} ${item.code}`,
      ),
    ];
    return {
      message,
      buttons,
    };
  });

  const chunks = _.chunk(messages, 70);
  return { chunks, departments };
};

const handle = async (ctx: Context, params: CommandHandlerParams) => {
  const chat = await Chat.getByUserId(params.id);

  if (!chat.authResult) {
    return await params.answer('Необходима авторизация (через полис)');
  }

  try {
    const { chunks } = await getDepartmentsMessages(chat);

    if (chunks.length === 0) {
      return params.answer(`Список специальностей *пуст*. Похоже вам не доступен ни один врач`);
    }

    if (params.answerCb) {
      await params.answerCb();
    }

    for (const chunk of chunks) {
      let message = chunk.map((ch) => ch.message).join('\n');
      const idx = chunks.indexOf(chunk);
      const [isFirts, isLast] = [idx === 0, idx === chunks.length - 1];
      if (isFirts) {
        message = [`Список доступных специальностей:`, message].join('\n\n');
      }
      if (isLast) {
        message = [message, StepMessages.doctors].join('\n\n');
      }
      const reply = isLast ? params.answerWithMarkdown.bind(ctx) : ctx.replyWithMarkdown.bind(ctx);
      await reply(message, {
        ...Markup.inlineKeyboard(
          chunk.flatMap((ch) => ch.buttons),
          {
            columns: 3,
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
