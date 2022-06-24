import { schedule } from 'node-cron';
import { Subscription } from './chat';
import { Telegraf } from 'telegraf';
import { getDoctorsWithSchedule, getFollowMessages, getSchedules } from '../services/doctors';
import _ from 'lodash';
import * as functions from 'firebase-functions';
import { getChats } from '../db';

export const start = (bot: Telegraf) => {
  return schedule('*/10 * * * *', async () => {
    functions.logger.log('run cron every 10 min');

    const chats = await getChats();

    functions.logger.log('Chats', chats.length);

    for (const chat of chats) {
      functions.logger.log('Chat', chat.userId);
      const subscriptions: Subscription[] = await chat.getAllSubscriptions().catch((err) => {
        functions.logger.error(err);
        return [];
      });

      functions.logger.log('Subs', subscriptions.length);

      await Promise.all(
        subscriptions.map(async (subscription) => {
          functions.logger.log('Check sub', subscription.query);
          const doctors = await getDoctorsWithSchedule(chat, subscription.query);
          const schedules = getSchedules(doctors);

          const sumBefore = _.sumBy(subscription.schedules, (schedule) => schedule.count_tickets);
          const sumAfter = _.sumBy(schedules, (schedule) => schedule.count_tickets);

          functions.logger.log('sumBefore/after', sumBefore, sumAfter);

          // Появились новые места для записи
          if (sumAfter > sumBefore) {
            const messages = getFollowMessages(schedules);
            await bot.telegram.sendMessage(chat.userId, `Появились новые места! Было ${sumBefore}, стало ${sumAfter}`);
            await Promise.all(messages.map((message) => bot.telegram.sendMessage(chat.userId, message)));
          }

          await chat.setSchedules(schedules, subscription.query);
        }),
      );
    }
  });
};
