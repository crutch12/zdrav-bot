// ctx.message.from.id;
import axios, { AxiosInstance } from 'axios';

import { Command } from '../types/Command';
import { AuthResult } from '../types/Auth';

const Chats = new Map<number, Chat>();

type Polis = {
  birthday: string;
  nPol: string;
  pol: string;
  sPol: string;
  auth: boolean;
}

type User = {

}

// type Auth = {
//
// }

const BASE_URL = 'https://uslugi.mosreg.ru/';

export class Chat {
  public readonly userId: number;
  public lastCommand: string;

  public polis?: Polis;
  public user?: User;
  public authResult?: AuthResult;

  private axiosInstance: AxiosInstance;

  public constructor(userId: number) {
    this.userId = userId;
    this.lastCommand = Command.UNKNOWN;
    this.axiosInstance = axios.create({ baseURL: BASE_URL });

    // if (false) {
    //   con
    // }
    // this.axios.post('');

    // this.polis = {
    //   birthday: "10.09.1998",
    //   nPol: "5050100839001548",
    //   pol: "5050100839001548",
    //   sPol: '5050100839001548',
    // }

    Chats.set(userId, this);
  }

  public static getByUserId(userId: number) {
    return Chats.get(userId) ?? new Chat(userId);
  }

  public setCommand(command: Command) {
    this.lastCommand = command;
  }

  public get axios() {
    return this.axiosInstance;
  }
}
