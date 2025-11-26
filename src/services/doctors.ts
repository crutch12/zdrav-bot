// GET https://zdrav.mosreg.ru/api/v2/emias/iemk/doctors?number=&birthday=&departmentId=&days=&doctorId=

import { Chat, Schedule } from '../lib/chat';
import { Doctor, DoctorsResult, Schedule as DoctorSchedule } from '../types/Doctor';
import { shortId } from '../utils';
import { sumBy } from 'lodash';
import { format } from 'date-fns';

const DAYS = 21;

export const DOC_WEEKEND_TYPE = 0;
export const getWorkingDays = (days: DoctorSchedule[]) => days.filter((x) => x.docBusyType.type !== DOC_WEEKEND_TYPE);
export interface DoctorsQuery {
  departmentId: string;
  lpuCode?: string;
  doctorId?: string;
  days?: number;
}

export const getDoctors = async (chat: Chat, doctorsQuery: DoctorsQuery) => {
  if (!chat.authResult) {
    throw new Error('Необходима авторизация (через полис)');
  }

  const { data: doctorsResult, status } = await chat.axios.get<DoctorsResult>('/api/v2/emias/iemk/doctors', {
    params: {
      // number: chat.polis.number,
      // birthday: chat.polis.birthday.split('.').reverse().join('-'), // 13.09.2000 -> 2000-09-13
      departmentId: doctorsQuery.departmentId,
      lpuCode: doctorsQuery.lpuCode,
      days: doctorsQuery.days || DAYS,
    },
  });

  if (doctorsResult.items) {
    return doctorsResult;
  }

  throw new Error(`${status}: ${JSON.stringify(doctorsResult, null, 2)}`);
};

export const getDoctorsWithSchedule = async (chat: Chat, doctorsQuery: DoctorsQuery) => {
  if (!chat.authResult) {
    throw new Error('Необходима авторизация (через полис)');
  }

  const foundDoctors = await getDoctors(chat, doctorsQuery);

  const doctors = foundDoctors.items
    .flatMap((item) => item.doctors)
    .filter((doctor) => (doctorsQuery.doctorId ? doctor.id.endsWith(doctorsQuery.doctorId) : true));

  if (!doctors.length) {
    throw new Error(
      `Не удалось найти доктора с doctorId: ${doctorsQuery.doctorId || '--'}, departmentId: ${
        doctorsQuery.departmentId
      }, lpuCode: ${doctorsQuery.lpuCode}`,
    );
  }

  const lpus = foundDoctors.items.map((item) => item.lpu);

  return { doctors, lpus };
};

export const getSchedules = (doctors: Doctor[], onlyAvailable = false) => {
  let schedules: Schedule[] = doctors.map((doctor) => {
    const workingDays = getWorkingDays(doctor.schedule);
    const days = workingDays.map((day) => ({
      count_tickets: day.count_tickets,
      date: day.date,
    }));
    return {
      id: doctor.id,
      displayName: doctor.displayName,
      doctorId: doctor.id,
      count_tickets: sumBy(days, (day) => day.count_tickets),
      days,
    };
  });

  if (onlyAvailable) {
    schedules = schedules
      .filter((schedule) => schedule.count_tickets > 0)
      .map((schedule) => ({
        ...schedule,
        days: schedule.days.filter((day) => day.count_tickets > 0),
      }));
  }

  return schedules;
};

export const getFollowMessages = (schedules: Schedule[]) =>
  schedules.map((schedule) => {
    const message = [
      `🧑‍⚕️ ${schedule.displayName} (\`${shortId(schedule.doctorId)}\`)`,
      `Свободных мест: *${schedule.count_tickets}*`,
      `*Дни:*\n${schedule.days.map((x) => `_${format(new Date(x.date), 'dd.MM.yyyy')}_ (${x.count_tickets} талонов)`).join('\n')}`,
    ].join('\n');
    return message;
  });
