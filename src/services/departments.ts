// GET https://uslugi.mosreg.ru/zdrav/doctor_appointment/api/departments?lpuCode=

import _ from 'lodash';
import { Chat } from '../lib/chat';
import { DepartmentsResult } from '../types/Department';

export const getDepartments = async (chat: Chat) => {
  if (!chat.authResult) {
    throw new Error('Необходима авторизация (через полис)');
  }

  const { data: departmentsResult } = await chat.axios.get<DepartmentsResult>(
    '/zdrav/doctor_appointment/api/departments',
  );

  if (departmentsResult.success) {
    departmentsResult.items = _.sortBy(departmentsResult.items, (i) => i.code);
    return departmentsResult;
  }

  throw new Error(`${departmentsResult.code}: ${departmentsResult.message}`);
};
