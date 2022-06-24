// import * as functions from "firebase-functions";

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

import * as functions from 'firebase-functions';
import { Telegraf } from 'telegraf';
import { commands } from './commands';
import { start } from './lib/cron';

const bot = new Telegraf(functions.config().telegram.token);

bot.launch().then(() => {
  bot.telegram.setMyCommands(commands);
  start(bot);
});

// error handling
bot.catch((err, ctx) => {
  functions.logger.error('[Bot] Error', err);
  ctx.reply(`Ooops, encountered an error for ${ctx.updateType}`, err);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// handle all telegram updates with HTTPs trigger
const echoBot = functions.https.onRequest(async (request, response) => {
  functions.logger.log('Incoming message', request.body);
  return await bot.handleUpdate(request.body, response);
});

export { echoBot, bot };
