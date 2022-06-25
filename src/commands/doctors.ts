import { bot } from '../bot';
import { Chat } from '../lib/chat';
import { getDoctors } from '../services/doctors';
import _ from 'lodash';
import { StepMessages } from './start';

export const command = 'doctors';
export const description = 'Посмотреть список врачей нужной специальности';

export const initialize = () => {
  bot.command(command, async (ctx) => {
    const chat = await Chat.getByUserId(ctx.message.from.id);

    const [departmentRaw] = ctx.message.text.split(/\s+/).slice(1);
    const departmentId = Number(departmentRaw);

    if (Number.isNaN(departmentId)) {
      return ctx.reply('(Ошибка!) Нужно указать id специальности врача. См. /departments');
    }

    try {
      const doctors = await getDoctors(chat, { departmentId });
      const messages = doctors.items.map(
        (item) =>
          `(*${item.lpu_code}*) - ${item.lpu.name}\n${item.doctors
            .map((doctor) => `(_${doctor.person_id}_) ${doctor.displayName}`)
            .join('\n')}`,
      );
      const chunks = _.chunk(messages, 5);
      await Promise.all(chunks.map((chunk) => ctx.replyWithMarkdown(chunk.join('\n\n'))));

      return ctx.replyWithMarkdown(StepMessages.follow);
    } catch (err) {
      console.error(err);
      return ctx.reply(`(Ошибка!) ${err.message}`);
    }
  });
};
