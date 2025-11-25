export type CommandHandlerParams = {
  id: number;
  text: string;
  answer: (text: string) => Promise<unknown>;
  answerCb?: (text?: string) => Promise<unknown>;
};
