import axios from 'axios';
import * as https from 'https';

import { Command } from '../types/Command';
import { AuthResult } from '../types/Auth';
import { DoctorsQuery } from '../services/doctors';
import { createChat, getChat, getSubscriptions, removeSubscription, setSubscription, updateChat } from '../db';
import { authByPolis } from '../services/auth';

export type Polis = {
  birthday: string;
  // nPol: string;
  number: string;
  // sPol: string;
  // auth: boolean;
};

const BASE_URL = 'https://zdrav.mosreg.ru';

const getKey = (...args: (string | number)[]) => {
  return args.filter(Boolean).join('__');
};

export type Subscription = {
  id: string;
  query: DoctorsQuery;
  schedules: Schedule[];
};

export type Schedule = {
  id: string;
  displayName: string;
  person_id: string;
  count_tickets: number;
  days: {
    count_tickets: number;
    date: string;
  }[];
};

export class Chat {
  public readonly userId: number;
  public lastCommand: string;

  private _polis?: Polis;
  private _authResult?: AuthResult;
  private _subscriptions: Subscription[];

  public constructor(
    userId: number,
    props: {
      polis?: Polis;
      authResult?: AuthResult;
      subscriptions?: Subscription[];
    },
  ) {
    this.userId = userId;
    this.lastCommand = Command.UNKNOWN;

    this._subscriptions = props.subscriptions || [];
    this._polis = props.polis || undefined;
    this._authResult = props.authResult || undefined;
  }

  public static async getByUserId(userId: number) {
    const chat = await getChat(userId);
    return chat ? chat : createChat(userId);
  }

  public static getSubscriptionKey({ lpuCode, departmentId, doctorId }: DoctorsQuery) {
    return getKey(lpuCode, departmentId, doctorId);
  }

  public setCommand(command: Command) {
    this.lastCommand = command;
  }

  public get axios() {
    return axios.create({
      baseURL: BASE_URL,
      httpAgent: new https.Agent({ rejectUnauthorized: false }),
      params: {
        number: this.polis.number,
        birthday: this.polis.birthday.split('.').reverse().join('-'), // 13.09.2000 -> 2000-09-13
      },
    });
  }

  public get polis() {
    return this._polis;
  }

  public get authResult() {
    return this._authResult;
  }

  public setPolis(polis: Polis) {
    this._polis = polis;
  }

  public setAuthResult(authResult: AuthResult) {
    this._authResult = authResult;
  }

  public async subscribeSchedules(schedules: Schedule[], { lpuCode, departmentId, doctorId }: DoctorsQuery) {
    return setSubscription(this, {
      id: getKey(lpuCode, departmentId, doctorId),
      schedules,
      query: { lpuCode, departmentId, doctorId },
    });
  }

  public async removeSubscription({ lpuCode, departmentId, doctorId }: DoctorsQuery) {
    return removeSubscription(this, getKey(lpuCode, departmentId, doctorId));
  }

  public async getAllSubscriptions() {
    this._subscriptions = await getSubscriptions(this);
    return this._subscriptions;
  }

  public async revalidate() {
    const authResult = await authByPolis(this);

    await updateChat(this, {
      authResult,
    });

    return this;
  }
}
