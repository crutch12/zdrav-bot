import { bot } from '../bot';
import { getDepartments } from '../services/departments';
import { Chat } from '../lib/chat';
import _ from 'lodash';

export const command = 'departments';
export const description = 'Посмотреть список специальностей и больниц';

export const initialize = () => {
  bot.command(command, async (ctx) => {
    const chat = await Chat.getByUserId(ctx.message.from.id);
    try {
      const departments = await getDepartments(chat);
      const messages = departments.items.map((item) => `${item.code} - ${item.title.slice(0, 30)}`);
      const chunks = _.chunk(messages, 70);
      return Promise.all(chunks.map((chunk) => ctx.reply(chunk.join('\n'))));
    } catch (err) {
      console.error(err);
      return ctx.reply(`(Ошибка!) ${err.message}`);
    }
  });
};
