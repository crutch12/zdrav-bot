import { bot } from '../bot';
import { Chat } from '../lib/chat';
import { authByPolis } from '../services/auth';

// 5050100839001548
// 10.09.1998

// cookie: polis_login_failed=1; SSESSa8582a3dc976377cc65d7fbc474627fe=-NKzZw7N0pEE54dAP4vBfi1DDzLG7zBjzNmDgsG8C3E; has_js=1; _ym_uid=1615208110757218746; _ym_d=1615208110; _ym_isad=1; _ym_visorc=w

export const initialize = () => {
  bot.command('polis', async(ctx) => {
    const chat = Chat.getByUserId(ctx.message.from.id)

    console.log(chat.userId);

    const [polis, birthday] = ctx.message.text.split(' ').slice(1);

    if (!polis || !birthday) {
      return ctx.reply('(Ошибка!) Необходимо ввести полис в формате: номер дата.рождения');
    }

    chat.polis = {
      birthday: birthday,
      // nPol: polis,
      nPol: null,
      pol: polis,
      // sPol: polis,
      sPol: null,
      auth: false,
    };

    // console.log(polis, birthday);

    ctx.reply(`Удалось добавить Номер полиса ${polis} и Дату рождения ${birthday}!`)

    ctx.reply('Начинаю аутентификацию на портале госуслуг...');

    try {
      const authResult = await authByPolis(chat);
      const doctor = authResult.items!.doctor;
      return ctx.reply(`Аутентификация прошла успешно. ${authResult.message}.\nВаш personGuid: ${authResult.items!.personGuid}\nВаш врач: ${[doctor.lastname, doctor.name, doctor.surname].join(' ')}`);
    }
    catch (err) {
      return ctx.reply(`(Ошибка!) ${err.message}`)
    }
  });
}
