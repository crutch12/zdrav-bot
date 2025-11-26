export const parseCommandMessage = (message: string) => {
  return message.split(/[_ ]+/).slice(1);
};

export const shortId = (id: string, length = 8) => id.slice(id.length - length, id.length);
