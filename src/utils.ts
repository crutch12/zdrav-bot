export const parseCommandMessage = (message: string) => {
  return message.split(/[_ ]+/).slice(1);
};
