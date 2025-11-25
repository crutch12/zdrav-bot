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
        ...(chat.authResult
          ? [
              `Ваш personGuid: \`${chat.authResult.personGuid}\``,
              `Ваш врач: ${chat.authResult.doctor ? [chat.authResult.doctor.lastname, chat.authResult.doctor.name, chat.authResult.doctor.surname].join(' ') : '(нет)'}`,
              ...(chat.authResult.doctor
                ? [
                    `Ваша больница: ${chat.authResult.doctor.lpu_name}`,
                    `Код больницы: *${chat.authResult.doctor.lpu_code}*`,
                  ]
                : []),
            ]
          : []),
      ].join('\n'),
    );
  });
};
