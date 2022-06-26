import { bot } from '../bot';
import { DoctorsQuery, getDoctorsWithSchedule, getFollowMessages, getSchedules } from '../services/doctors';
import { Chat } from '../lib/chat';
import { parseCommandMessage } from '../utils';
import { Markup } from 'telegraf';
import * as unfollow from './unfollow';

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

export const initialize = () => {
  bot.command(command, async (ctx) => {
    const chat = await Chat.getByUserId(ctx.message.from.id);

    if (!chat.authResult) {
      return ctx.reply(`Необходима авторизация (через полис)`);
    }

    const [lpuCode, departmentId, doctorId] = parseCommandMessage(ctx.message.text);

    if (!lpuCode || !departmentId) {
      return ctx.reply('(Ошибка!) Нужно указать КОД_БОЛЬНИЦЫ КОД_СПЕЦИАЛЬНОСТИ +ID_ДОКТОРА. См. /doctors');
    }

    const doctorsQuery = { departmentId, lpuCode, doctorId };

    try {
      await ctx.replyWithMarkdown(`Создаём подписку *${Chat.getSubscriptionKey(doctorsQuery)}*`);

      const { messages, subscription } = await generateFollowMessages(chat, doctorsQuery);

      await Promise.all(messages.map((message) => ctx.replyWithMarkdown(message)));

      return await ctx.replyWithMarkdown(`Подписка *${subscription.id}* успешно создана`, {
        ...Markup.inlineKeyboard([
          Markup.button.callback(`Удалить подписку ${subscription.id}`, `${unfollow.command} ${subscription.id}`),
        ]),
      });
    } catch (err) {
      console.error(err);
      return ctx.reply(`(Ошибка!) ${err.message}`);
    }
  });
  bot.action(new RegExp(`^${command}.*$`), async (ctx) => {
    const chat = await Chat.getByUserId(ctx.callbackQuery.from.id);

    if (!chat.authResult) {
      return await ctx.answerCbQuery('Необходима авторизация (через полис)');
    }

    const [lpuCode, departmentId, doctorId] = parseCommandMessage(ctx.match[0]);

    if (!lpuCode || !departmentId) {
      return ctx.reply('(Ошибка!) Нужно указать КОД_БОЛЬНИЦЫ КОД_СПЕЦИАЛЬНОСТИ +ID_ДОКТОРА. См. /doctors');
    }

    const doctorsQuery = { departmentId, lpuCode, doctorId };

    try {
      await ctx.replyWithMarkdown(`Создаём подписку *${Chat.getSubscriptionKey(doctorsQuery)}*`);

      const { messages, subscription } = await generateFollowMessages(chat, doctorsQuery);

      await ctx.answerCbQuery();

      await Promise.all(messages.map((message) => ctx.replyWithMarkdown(message)));

      return await ctx.replyWithMarkdown(`Подписка *${subscription.id}* успешно создана`, {
        ...Markup.inlineKeyboard([
          Markup.button.callback(`Удалить подписку ${subscription.id}`, `${unfollow.command} ${subscription.id}`),
        ]),
      });
    } catch (err) {
      console.error(err);
      return ctx.answerCbQuery(`(Ошибка!) ${err.message}`);
    }
  });
};
