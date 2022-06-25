import { bot } from '../bot';

export const command = 'start';
export const description = 'Начать';

const Mocks = {
  polis: '5040200838017611',
  birthday: '01.12.2000',
  departmentId: '8',
  lpuCode: '0504032',
  doctorId: 'a3b5392d-024c-43f3-bd4f-d222b907e541',
};

export const StepMessages = {
  polis: ['1) Указываем полис (нового типа) и дату:', `*/polis ${Mocks.polis} ${Mocks.birthday}*`].join('\n'),
  departments: ['2) Получаем список доступных специальностей:', '*/departments*'].join('\n'),
  doctors: [
    `3) Из специальностей выбираем номер нужной (_например ${Mocks.departmentId}_) и запрашиваем список врачей:`,
    `*/doctors ${Mocks.departmentId}*`,
  ].join('\n'),
  follow: [
    `4) Создание подписка. Из врачей берём номер нужной больницы (_например ${Mocks.lpuCode}_) и номер специальности (из шага 2):`,
    `*/follow ${Mocks.lpuCode} ${Mocks.departmentId}*`,
  ].join('\n'),
  follow2: [
    `4.1) Можно подписаться на конкретного врача (_например ${Mocks.doctorId}_)`,
    `*/follow ${Mocks.lpuCode} ${Mocks.departmentId}* *${Mocks.doctorId}*`,
  ].join('\n'),
  unfollow: (lpuCode: string, departmentId: string, doctorId?: string) =>
    [
      'Чтобы отписаться от созданной подписки:',
      `*/unfollow ${lpuCode} ${departmentId}${doctorId ? ` ${doctorId}` : ''}*`,
    ].join('\n'),
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
  `${StepMessages.unfollow(Mocks.lpuCode, Mocks.departmentId)}\n`,
  'Помощь: */help*',
  'Удалить введённые данные и подписки: */end*',
].join('\n');

export const initialize = () => {
  bot.command(command, (ctx) => {
    return ctx.replyWithMarkdown(START_MESSAGE);
  });
};
