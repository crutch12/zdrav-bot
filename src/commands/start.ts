import { bot } from '../bot';
import { shortId } from '../utils';

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
  polis: ['1) Укажите номер полиса/свидетельства и дату рождения:', `*/polis ${Mocks.polis} ${Mocks.birthday}*`].join(
    '\n',
  ),
  departments: ['2) Запросите список доступных специальностей:', '*/departments*'].join('\n'),
  doctors: [
    `3) Из специальностей выберите номер нужной (_например ${Mocks.departmentId}_) и запросите список больниц`,
    // `\`/hospitals ${Mocks.departmentId}\` (скопируйте в чат)`,
  ].join('\n'),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  hospitals: (lpuCode = Mocks.lpuCode, departmentId = Mocks.departmentId) =>
    [
      `3.1) Из больниц выберите номер нужной (_например ${lpuCode}_) и запросите список врачей`,
      // `\`/doctors ${departmentId} ${lpuCode}\` (скопируйте в чат)`,
    ].join('\n'),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  follow: (lpuCode = Mocks.lpuCode, departmentId = Mocks.departmentId, doctorId = shortId(Mocks.doctorId)) =>
    [
      `4) *Создание подписки.*`,
      'Используйте кнопки подписки под каждым из сообщений для выбора врача, на которого хотите подписаться',
      // '',
      // 'Либо выберите нужных врачей и по очереди и отправьте команды подписки в чат',
      // `Например: \`/follow ${lpuCode} ${departmentId} ${doctorId}\``,
    ].join('\n'),
  unfollow: (lpuCode = Mocks.lpuCode, departmentId = Mocks.departmentId, doctorId = shortId(Mocks.doctorId)) =>
    [
      'Отписаться от созданной подписки можно через /unfollow:',
      `Например: \`/unfollow ${lpuCode} ${departmentId} ${doctorId}\``,
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
  `${StepMessages.hospitals(Mocks.lpuCode, Mocks.departmentId)}`,
  '',
  `${StepMessages.follow(Mocks.lpuCode, Mocks.departmentId, shortId(Mocks.doctorId))}`,
  '',
  '5) *Готово.*',
  'Можно подписаться сразу на несколько больниц + специальностей + врачей',
  '*Наличие новых талонов проверяется раз в 10 минут.*',
  '',
  `${StepMessages.unfollow(Mocks.lpuCode, Mocks.departmentId, shortId(Mocks.doctorId))}`,
  '',
  'Помощь: */help*',
  'Список активных подписок: */list* (через него можно отписаться)',
  'Посмотреть введённые данные: */me*',
  'Удалить все введённые данные и подписки: */end*',
].join('\n');

export const initialize = () => {
  bot.command(command, (ctx) => {
    return ctx.replyWithMarkdown(START_MESSAGE);
  });
};
