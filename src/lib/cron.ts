import { schedule } from 'node-cron';
import { Subscription } from './chat';
import { Telegraf } from 'telegraf';
import { getDoctorsWithSchedule, getFollowMessages, getSchedules } from '../services/doctors';
import _ from 'lodash';
import { getChats } from '../db';

export const start = (bot: Telegraf) => {
  return schedule('*/10 * * * *', async () => {
    console.info('run cron every 10 min');

    const chats = await getChats();

    console.info('Chats', chats.length);

    for (const chat of chats) {
      console.info('Chat', chat.userId);

      if (chat.cookieExpired) {
        console.info('Cookie expired, should revalidate', chat.userId);
        await chat.revalidate().catch((err) => {
          console.error('Couldn\t revalidate chat', chat.userId);
          console.error(err);
        });
      }

      const subscriptions: Subscription[] = await chat.getAllSubscriptions().catch((err) => {
        console.info(err);
        return [];
      });

      console.info('Subs', subscriptions.length);

      await Promise.all(
        subscriptions.map(async (subscription) => {
          console.info('Check sub', subscription.query);
          const doctors = await getDoctorsWithSchedule(chat, subscription.query);
          const schedules = getSchedules(doctors);

          const sumBefore = _.sumBy(subscription.schedules, (schedule) => schedule.count_tickets);
          const sumAfter = _.sumBy(schedules, (schedule) => schedule.count_tickets);

          console.info('sumBefore/after', sumBefore, sumAfter);

          // Появились новые места для записи
          if (sumAfter > sumBefore) {
            const messages = getFollowMessages(schedules);
            await bot.telegram.sendMessage(chat.userId, `Появились новые места! Было ${sumBefore}, стало ${sumAfter}`);
            await Promise.all(messages.map((message) => bot.telegram.sendMessage(chat.userId, message)));
          }

          await chat.subscribeSchedules(schedules, subscription.query);
        }),
      );
    }
  });
};
