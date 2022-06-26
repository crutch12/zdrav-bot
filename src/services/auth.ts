import FormData from 'form-data';

import { Chat } from '../lib/chat';
import { AuthResult } from '../types/Auth';

// POST https://uslugi.mosreg.ru/zdrav/doctor_appointment/api/personal
// birthday: "11.11.1111"
// nPol: "1231231231231231"
// pol: "1231231231231231"
// sPol: null
export const authByPolis = async (chat: Chat) => {
  if (!chat.polis) {
    throw new Error('Необходимо заполнить полис');
  }

  const polisFormData = new FormData();
  polisFormData.append('pol', chat.polis.pol);
  polisFormData.append('birthday', chat.polis.birthday);

  const { data: authResult } = await chat.axios.post<AuthResult>(
    '/zdrav/doctor_appointment/api/personal',
    polisFormData,
    {
      headers: {
        ...polisFormData.getHeaders(),
      },
    },
  );

  if (authResult.success) {
    chat.setAuthResult(authResult);
    return authResult;
  }

  throw new Error(`${authResult.code}: ${authResult.message}`);
};

// GET https://uslugi.mosreg.ru/zdrav/
// run without cookie!!
export const getInitialSessionCookie = async (chat: Chat) => {
  const { headers } = await chat.axios.get('/zdrav/', { headers: { Cookie: null } });
  return chat.setInitialCookies(headers['set-cookie']);
};
