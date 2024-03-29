// GET https://uslugi.mosreg.ru/zdrav/doctor_appointment/api/doctors?lpuCode=&departmentId=76&doctorId=&days=14

import { Chat, Schedule } from '../lib/chat';
import { Doctor, DoctorsResult, Week1 } from '../types/Doctor';
import { shortPersonId } from '../utils';

const DAYS = 14;

export const DOC_WEEKEND_TYPE = 0;
export const getWorkingDays = (days: Week1[]) => days.filter((x) => x.docBusyType.type !== DOC_WEEKEND_TYPE);
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

  const { data: doctorsResult } = await chat.axios.get<DoctorsResult>('/zdrav/doctor_appointment/api/doctors', {
    params: {
      departmentId: doctorsQuery.departmentId,
      lpuCode: doctorsQuery.lpuCode,
      days: doctorsQuery.days || DAYS,
    },
  });

  if (doctorsResult.success) {
    return doctorsResult;
  }

  throw new Error(`${doctorsResult.code}: ${doctorsResult.message}`);
};

export const getDoctorsWithSchedule = async (chat: Chat, doctorsQuery: DoctorsQuery) => {
  if (!chat.authResult) {
    throw new Error('Необходима авторизация (через полис)');
  }

  const foundDoctors = await getDoctors(chat, doctorsQuery);

  const doctors = foundDoctors.items
    .flatMap((item) => item.doctors)
    .filter((doctor) => (doctorsQuery.doctorId ? doctor.person_id.startsWith(doctorsQuery.doctorId) : true));

  if (!doctors.length) {
    throw new Error(
      `Не удалось найти доктора с doctorId: ${doctorsQuery.doctorId || '--'}, departmentId: ${
        doctorsQuery.departmentId
      }, lpuCode: ${doctorsQuery.lpuCode}`,
    );
  }

  return doctors;
};

export const getSchedules = (doctors: Doctor[], onlyAvailable = false) => {
  let schedules: Schedule[] = doctors.map((doctor) => {
    const workingDays = [...getWorkingDays(doctor.week1), ...getWorkingDays(doctor.week2)];
    return {
      id: doctor.id,
      displayName: doctor.displayName,
      person_id: doctor.person_id,
      count_tickets: doctor.count_tickets,
      days: workingDays.map((day) => ({
        count_tickets: day.count_tickets,
        date_short: day.date_short,
      })),
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
      `(_${shortPersonId(schedule.person_id)}_) ${schedule.displayName}`,
      `Свободных мест: *${schedule.count_tickets}*`,
      `*Дни:*\n${schedule.days.map((x) => `_${x.date_short}_ (${x.count_tickets} талонов)`).join('\n')}`,
    ].join('\n');
    return message;
  });
