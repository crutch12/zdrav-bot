// import * as functions from "firebase-functions";

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

import * as functions from "firebase-functions";
import { Telegraf } from "telegraf";

import * as https from 'https'
https.globalAgent.options.rejectUnauthorized = false

const bot = new Telegraf(functions.config().telegram.token, {
  telegram: { webhookReply: true },
});

// error handling
// @ts-ignore
bot.catch((err, ctx) => {
  functions.logger.error("[Bot] Error", err);
  return ctx.reply(`Ooops, encountered an error for ${ctx.updateType}`, err);
});


// handle all telegram updates with HTTPs trigger
const echoBot = functions.https.onRequest(async (request, response) => {
  functions.logger.log("Incoming message", request.body);
  return await bot.handleUpdate(request.body, response).then((rv) => {
    // if it's not a request from the telegram, rv will be undefined, but we should respond with 200
    // @ts-ignore
    // return !rv && response.sendStatus(200);
  });
});

export { echoBot, bot };
