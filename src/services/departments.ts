// GET https://zdrav.mosreg.ru/api/v2/emias/iemk/departments?number=&birthday=

import _ from 'lodash';
import { Chat } from '../lib/chat';
import { DepartmentsResult } from '../types/Department';

export const getDepartments = async (chat: Chat) => {
  if (!chat.authResult) {
    throw new Error('Необходима авторизация (через полис)');
  }

  // const poilis = chat.polis;

  const { data: departmentsResult, status } = await chat.axios.get<DepartmentsResult>(
    // '/zdrav/doctor_appointment/api/departments',
    '/api/v2/emias/iemk/departments',
    {
      params: {
        // number: chat.polis.number,
        // birthday: chat.polis.birthday.split('.').reverse().join('-'), // 13.09.2000 -> 2000-09-13
      },
    },
  );

  if (departmentsResult.items) {
    departmentsResult.items = _.orderBy(departmentsResult.items, (i) => Number(i.code));
    return departmentsResult;
  }

  throw new Error(`${status}: ${JSON.stringify(departmentsResult, null, 2)}`);
};
