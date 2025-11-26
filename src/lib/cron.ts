import { schedule } from 'node-cron';
import { Subscription } from './chat';
import { Markup, Telegraf } from 'telegraf';
import { getDoctorsWithSchedule, getFollowMessages, getSchedules } from '../services/doctors';
import _ from 'lodash';
import { getChats } from '../db';
import * as unfollow from '../commands/unfollow';

export const start = (bot: Telegraf) => {
  return schedule('*/10 * * * *', async () => {
    console.info('run cron every 10 min');
    return run(bot);
  });
};

export const run = async (bot: Telegraf) => {
  const chats = await getChats();

  console.info('Chats', chats.length);

  for (const chat of chats) {
    console.info('Chat', chat.userId);

    // if (chat.cookieExpired) {
    //   console.info('Cookie expired, should revalidate', chat.userId);
    //   await chat.revalidate().catch((err) => {
    //     console.error('Couldn\t revalidate chat', chat.userId);
    //     console.error(err);
    //   });
    // }

    const subscriptions: Subscription[] = await chat.getAllSubscriptions().catch((err) => {
      console.info(err);
      return [];
    });

    console.info('Subs', subscriptions.length);

    await Promise.all(
      subscriptions.map(async (subscription) => {
        const query = subscription.query;
        console.info('Check sub', query);
        try {
          const { doctors } = await getDoctorsWithSchedule(chat, query);
          const schedules = getSchedules(doctors, true);

          const sumBefore = _.sumBy(subscription.schedules, (schedule) => schedule.count_tickets);
          const sumAfter = _.sumBy(schedules, (schedule) => schedule.count_tickets);

          console.info('sumBefore/after', sumBefore, sumAfter);

          // Появились новые места для записи
          if (sumAfter > sumBefore) {
            const messages = getFollowMessages(schedules);
            await bot.telegram.sendMessage(
              chat.userId,
              [
                `🎉 ${subscription.doctor?.displayName} - новые места! Было ${sumBefore}, стало ${sumAfter}`,
                `[Записаться](https://zdrav.mosreg.ru/)`,
              ].join('\n'),
              {
                ...Markup.inlineKeyboard([
                  Markup.button.callback(
                    `🗑️ Удалить подписку ${subscription.id}`,
                    `${unfollow.command} ${subscription.id}`,
                  ),
                ]),
                parse_mode: 'Markdown',
              },
            );
            await Promise.all(
              messages.map((message) =>
                bot.telegram.sendMessage(chat.userId, message, {
                  parse_mode: 'Markdown',
                }),
              ),
            );
          }

          await chat.subscribeSchedules(schedules, subscription.query, {
            doctor: subscription.doctor,
            lpu: subscription.lpu,
          });
        } catch (err) {
          console.error('Couldn\t check subscription.', `Chat: ${chat.userId}`, `Subscription: ${subscription.id}`);
          console.error(err);
        }
      }),
    );
  }

  return 'done';
};
