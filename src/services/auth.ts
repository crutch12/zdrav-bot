// import FormData from 'form-data';

import { Chat } from '../lib/chat';
import { AuthResult } from '../types/Auth';

// POST https://zdrav.mosreg.ru/api/v2/emias/iemk/personal?number=&birthday=
// birthday: "1111-11-11"
// number: "1231231231231231"
export const authByPolis = async (chat: Chat) => {
  if (!chat.polis) {
    throw new Error('Необходимо заполнить полис');
  }

  // const polisFormData = new FormData();
  // polisFormData.append('number', chat.polis.pol);
  // polisFormData.append('birthday', chat.polis.birthday.split('.').reverse().join('-'));

  const { data: authResult, status } = await chat.axios.get<AuthResult>(
    '/api/v2/emias/iemk/personal',
    {
      params: {
        // number: chat.polis.number,
        // birthday: chat.polis.birthday.split('.').reverse().join('-'), // 13.09.2000 -> 2000-09-13
      }
    }
  );

  // console.log({ authResult })

  if (authResult.personGuid) {
    chat.setAuthResult(authResult);
    return authResult;
  }

  throw new Error(`${status}: ${JSON.stringify(authResult, null, 2)}`);
};
