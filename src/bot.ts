// import * as functions from "firebase-functions";

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

import { Telegraf } from 'telegraf';
import { commands } from './commands';
import { start } from './lib/cron';

const bot = new Telegraf(process.env.TELEGRAM_TOKEN, { telegram: { webhookReply: true } });

bot.launch().then(() => {
  bot.telegram.setMyCommands(commands);
  start(bot);
});

// error handling
bot.catch((err, ctx) => {
  console.error(err);
  ctx.reply(`Ooops, encountered an error for ${ctx.updateType}`, err);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// handle all telegram updates with HTTPs trigger
const echoBot = async (body, response) => {
  console.log('Incoming message', body);
  return await bot.handleUpdate(body, response).then((rv) => {
    // if it's not a request from the telegram, rv will be undefined, but we should respond with 200
    // @ts-ignore
    // return !rv && response.sendStatus(200);
  });
};

export { bot, echoBot };
