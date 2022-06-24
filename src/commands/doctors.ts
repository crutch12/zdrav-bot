import { bot } from '../bot';
import { Chat } from '../lib/chat';
import { getDoctors } from '../services/doctors';
import _ from 'lodash';

export const command = 'doctors';
export const description = 'Посмотреть список врачей нужной специальности';

export const initialize = () => {
  bot.command(command, async (ctx) => {
    const chat = await Chat.getByUserId(ctx.message.from.id);

    const [departmentRaw] = ctx.message.text.split(' ').slice(1);
    const departmentId = Number(departmentRaw);

    if (Number.isNaN(departmentId)) {
      return ctx.reply('(Ошибка!) Нужно указать id специальности врача (департамента). См. /departments');
    }

    try {
      const doctors = await getDoctors(chat, { departmentId });
      const messages = doctors.items.map(
        (item) =>
          `(${item.lpu_code}) - ${item.lpu.name}\n${item.doctors
            .map((doctor) => `(${doctor.person_id}) ${doctor.displayName}`)
            .join('\n')}`,
      );
      const chunks = _.chunk(messages, 5);
      return Promise.all(chunks.map((chunk) => ctx.reply(chunk.join('\n\n'))));
    } catch (err) {
      console.error(err);
      return ctx.reply(`(Ошибка!) ${err.message}`);
    }
  });
};
