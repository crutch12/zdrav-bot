// GET https://uslugi.mosreg.ru/zdrav/doctor_appointment/api/doctors?lpuCode=&departmentId=71&doctorId=&days=14
// auth cookie by police
// GET https://uslugi.mosreg.ru/zdrav/doctor_appointment/api/doctors?lpuCode=&departmentId=8&doctorId=&days=14

// https://uslugi.mosreg.ru/zdrav/doctor_appointment/api/doctors?lpuCode=&departmentId=52&doctorId=12cbb325-ba4f-4551-ac87-0be1c2aec6ba&days=14

// /zdrav/doctor_appointment/api/doctors?lpuCode=0701016&departmentId=52&doctorId=12cbb325-ba4f-4551-ac87-0be1c2aec6ba&days=14

import { Chat, Schedule } from '../lib/chat';
import { Doctor, DoctorsResult, Week1 } from '../types/Doctor';

const DAYS = 14;

export const DOC_WORKS_TYPE = 1;
export const getWorkingDays = (days: Week1[]) => days.filter((x) => x.docBusyType.type === DOC_WORKS_TYPE);
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
    .filter((doctor) => (doctorsQuery.doctorId ? doctor.person_id === doctorsQuery.doctorId : true));

  if (!doctors.length) {
    throw new Error(
      `Не удалось найти доктора с doctorId: ${doctorsQuery.doctorId || '--'}, departmentId: ${
        doctorsQuery.departmentId
      }, lpuCode: ${doctorsQuery.lpuCode}`,
    );
  }

  return doctors;
};

export const getSchedules = (doctors: Doctor[]) => {
  const schedules: Schedule[] = doctors.map((doctor) => {
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

  return schedules;
};

export const getFollowMessages = (schedules: Schedule[]) =>
  schedules.map((schedule) => {
    const message = [
      `(${schedule.person_id})\n${schedule.displayName}`,
      `Свободных мест: ${schedule.count_tickets}`,
      `Дни приёма:\n${schedule.days.map((x) => `${x.date_short} (${x.count_tickets} талонов)`).join('\n')}`,
    ].join('\n');
    return message;
  });
