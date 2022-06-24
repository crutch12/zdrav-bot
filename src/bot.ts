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

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

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

export { bot };
