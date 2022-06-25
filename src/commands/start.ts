import { bot } from '../bot';

export const command = 'start';
export const description = 'Начать';

export const StepMessages = {
  polis: ['1) Указываем полис (нового типа):', '*/polis 5040200838017611 01.12.2000*'].join('\n'),
  departments: ['2) Получаем список доступных специальностей:', '*/departments*'].join('\n'),
  doctors: [
    '3) Из специальностей выбираем номер нужной (_например 8_) и запрашиваем список врачей:',
    '*/doctors 8*\n',
  ].join('\n'),
  follow: [
    '4) Из врачей берём номер нужной больницы (_например 0504032_) и номер специальности (из шага 2) и подписываемся на места',
    '*/follow 0504032 8*',
  ].join('\n'),
  follow2: [
    '4.1) Можно подписаться на конкретного врача (_например a3b5392d-024c-43f3-bd4f-d222b907e541_)',
    '*/follow 0504032 8 a3b5392d-024c-43f3-bd4f-d222b907e541*',
  ].join('\n'),
  unfollow: ['Чтобы отписаться от созданной подписки:', '*/unfollow 0504032 8*'].join('\n'),
};

export const START_MESSAGE = [
  '*Бот, который проверяет (подписывается на) доступные места больнице*\n',
  'Этот бот предназначен для подписки на новые места (талоны) на https://uslugi.mosreg.ru/zdrav/\n',
  '*Зачем?*\n',
  'Чтобы иметь уведомление о доступных записях к нужными врачам\n',
  '*Чтобы подписаться:*\n',
  `${StepMessages.polis}\n`,
  `${StepMessages.departments}\n`,
  `${StepMessages.doctors}\n`,
  `${StepMessages.follow}\n`,
  `${StepMessages.follow2}\n`,
  '5) Готово. Можно подписаться сразу на несколько больниц + специальностей.\n',
  `${StepMessages.unfollow}\n`,
  'Помощь: */help*',
  'Удалить введённые данные и подписки: */end*',
].join('\n');

export const initialize = () => {
  bot.command(command, (ctx) => {
    return ctx.replyWithMarkdown(START_MESSAGE);
  });
};
