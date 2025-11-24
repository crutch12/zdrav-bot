import { bot } from '../bot';
import { Chat } from '../lib/chat';

export const command = 'me';
export const description = 'Посмотреть введённые данные';

export const initialize = () => {
  bot.command(command, async (ctx) => {
    const chat = await Chat.getByUserId(ctx.message.from.id);
    if (!chat.polis) {
      return ctx.reply('(Ошибка!) Необходимо указать полис. См. /polis');
    }
    return ctx.replyWithMarkdown(
      [
        `Номер полиса: \`${chat.polis.number}\``,
        `Дата рождения: \`${chat.polis.birthday}\``,
        `Аутентификация пройдена: ${chat.authResult ? 'Да' : '*Нет*'}`,
      ].join('\n'),
    );
  });
};
