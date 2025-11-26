import { ExtraEditMessageText } from 'telegraf/typings/telegram-types';

export type CommandHandlerParams = {
  id: number;
  text: string;
  answer: (text: string) => Promise<unknown>;
  answerCb?: (text?: string) => Promise<unknown>;
  answerWithMarkdown: (text: string, extra?: ExtraEditMessageText) => Promise<unknown>;
};
