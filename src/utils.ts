export const parseCommandMessage = (message: string) => {
  return message.split(/[_ ]+/).slice(1);
};

export const shortPersonId = (id: string, length = 8) => id.slice(0, length);
