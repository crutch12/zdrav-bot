import { bot } from '../bot';
import { getDepartments } from '../services/departments';
import { Chat } from '../lib/chat';
import _ from 'lodash';
import { StepMessages } from './start';

export const command = 'departments';
export const description = 'Посмотреть список доступных специальностей';

export const initialize = () => {
  bot.command(command, async (ctx) => {
    const chat = await Chat.getByUserId(ctx.message.from.id);
    try {
      const departments = await getDepartments(chat);
      const messages = departments.items.map((item) => `*${item.code}* - ${item.title.slice(0, 60)}`);
      const chunks = _.chunk(messages, 70);
      await Promise.all(chunks.map((chunk) => ctx.replyWithMarkdown(chunk.join('\n'))));

      return ctx.replyWithMarkdown(StepMessages.doctors);
    } catch (err) {
      console.error(err);
      return ctx.reply(`(Ошибка!) ${err.message}`);
    }
  });
};
