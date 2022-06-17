// POST https://uslugi.mosreg.ru/zdrav/doctor_appointment/api/personal
// birthday: "11.11.1111"
// nPol: "1231231231231231"
// pol: "1231231231231231"
// sPol: null
import * as FormData from 'form-data';

import { Chat } from '../lib/chat';
import { AuthResult } from '../types/Auth';

export const authByPolis = async(chat: Chat) => {
  if (!chat.polis) {
    throw new Error('Необходимо заполнить полис');
  }

  const polisFormData = new FormData();
  polisFormData.append('pol', chat.polis.pol);
  polisFormData.append('birthday', chat.polis.birthday);

  const { data: authResult } = await chat.axios.post<AuthResult>('/zdrav/doctor_appointment/api/personal', polisFormData, {
    headers: polisFormData.getHeaders(),
  });

  if (authResult.success) {
    chat.authResult = authResult;
    return authResult;
  }

  throw new Error(`${authResult.code}: ${authResult.message}`);
}
