import { bot } from '../bot';
import { shortPersonId } from '../utils';

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
  polis: ['1) Укажите полис (нового типа) и дату рождения:', `*/polis ${Mocks.polis} ${Mocks.birthday}*`].join('\n'),
  departments: ['2) Запросите список доступных специальностей:', '*/departments*'].join('\n'),
  doctors: [
    `3) Из специальностей выберите номер нужной (_например ${Mocks.departmentId}_) и запросите список врачей:`,
    `*/doctors ${Mocks.departmentId}*`,
  ].join('\n'),
  follow: (lpuCode = Mocks.lpuCode, departmentId = Mocks.departmentId) =>
    [
      `4) *Создание подписки.*\nИз врачей выберите номер нужной больницы (_например ${lpuCode}_) и номер специальности (из шага 2):`,
      `*/follow ${lpuCode} ${departmentId}*`,
    ].join('\n'),
  follow2: [
    `4.1) Можно подписаться на конкретного врача (_например ${shortPersonId(Mocks.doctorId)}_)`,
    `*/follow ${Mocks.lpuCode} ${Mocks.departmentId}* *${shortPersonId(Mocks.doctorId)}*`,
  ].join('\n'),
  unfollow: (lpuCode: string, departmentId: string, doctorId?: string) =>
    [
      'Чтобы отписаться от созданной подписки:',
      `*/unfollow ${lpuCode} ${departmentId}${doctorId ? ` ${doctorId}` : ''}*`,
    ].join('\n'),
};

export const START_MESSAGE = [
  '*Бот, который проверяет (подписывается на) доступные места в больнице*',
  '',
  'Этот бот предназначен для подписки на новые места (талоны) на https://zdrav.mosreg.ru',
  '',
  '*Зачем?*',
  '',
  'Чтобы иметь уведомление о доступных записях к нужными врачам',
  '',
  '*Чтобы подписаться:*',
  '',
  `${StepMessages.polis}`,
  '',
  `${StepMessages.departments}`,
  '',
  `${StepMessages.doctors}`,
  '',
  `${StepMessages.follow(Mocks.lpuCode, Mocks.departmentId)}`,
  '',
  `${StepMessages.follow2}`,
  '',
  '5) Готово. Можно подписаться сразу на несколько больниц + специальностей',
  '*Наличие новых талонов проверяется раз в 10 минут.*',
  '',
  `${StepMessages.unfollow(Mocks.lpuCode, Mocks.departmentId)}`,
  '',
  'Помощь: */help*',
  'Список активных подписок: */list*',
  'Посмотреть введённые данные: */me*',
  'Удалить введённые данные и подписки: */end*',
].join('\n');

export const initialize = () => {
  bot.command(command, (ctx) => {
    return ctx.replyWithMarkdown(START_MESSAGE);
  });
};
