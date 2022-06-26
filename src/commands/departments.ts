import { bot } from '../bot';
import { getDepartments } from '../services/departments';
import { Chat } from '../lib/chat';
import _ from 'lodash';
import { StepMessages } from './start';
import { Markup } from 'telegraf';
import * as doctors from './doctors';

export const command = 'departments';
export const description = 'Посмотреть список доступных специальностей';

export const initialize = () => {
  bot.command(command, async (ctx) => {
    const chat = await Chat.getByUserId(ctx.message.from.id);

    if (!chat.authResult) {
      return await ctx.reply('Необходима авторизация (через полис)');
    }

    try {
      const departments = await getDepartments(chat);
      const messages = departments.items.map((item) => `*${item.code}* - ${item.title.slice(0, 60)}`);
      const chunks = _.chunk(messages, 70);

      if (chunks.length === 0) {
        return ctx.replyWithMarkdown(`Список специальностей *пуст*. Похоже вам не доступен ни один врач`);
      }

      await ctx.replyWithMarkdown(`Список доступных специальностей:`);

      await Promise.all(chunks.map((chunk) => ctx.replyWithMarkdown(chunk.join('\n'))));

      return ctx.replyWithMarkdown(StepMessages.doctors, {
        ...Markup.inlineKeyboard(
          departments.items.map((department) =>
            Markup.button.callback(`${department.code}`, `${doctors.command} ${department.code}`),
          ),
          {
            columns: 4,
          },
        ),
      });
    } catch (err) {
      console.error(err);
      return ctx.reply(`(Ошибка!) ${err.message}`);
    }
  });
};
