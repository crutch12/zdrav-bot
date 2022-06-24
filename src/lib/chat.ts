import axios, { AxiosInstance } from 'axios';
import * as https from 'https';

import { Command } from '../types/Command';
import { AuthResult } from '../types/Auth';
import { DoctorsQuery } from '../services/doctors';
import { createChat, getChat, getSubscriptions, removeSubscription, setSubscription } from '../db';

export type Polis = {
  birthday: string;
  nPol: string;
  pol: string;
  sPol: string;
  auth: boolean;
};

const BASE_URL = 'https://uslugi.mosreg.ru/';

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
    date_short: string;
  }[];
};

export class Chat {
  public readonly userId: number;
  public lastCommand: string;

  public polis?: Polis;
  public authResult?: AuthResult;
  public subscriptions: Subscription[];

  private axiosInstance: AxiosInstance;

  public constructor(
    userId: number,
    props: { polis?: Polis; authResult?: AuthResult; subscriptions?: Subscription[] },
  ) {
    this.userId = userId;
    this.lastCommand = Command.UNKNOWN;
    this.axiosInstance = axios.create({
      baseURL: BASE_URL,
      httpAgent: new https.Agent({ rejectUnauthorized: false }),
      headers: {
        'User-Agent': 'PostmanRuntime/7.28.4',
      },
    });

    this.subscriptions = props.subscriptions || [];
    this.polis = props.polis || undefined;
    this.authResult = props.authResult || undefined;
  }

  public static async getByUserId(userId: number) {
    const chat = await getChat(userId);
    return chat ? chat : createChat(userId);
  }

  public setCommand(command: Command) {
    this.lastCommand = command;
  }

  public get axios() {
    return this.axiosInstance;
  }

  public async setSchedules(schedules: Schedule[], { lpuCode, departmentId, doctorId }: DoctorsQuery) {
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
    return getSubscriptions(this);
  }
}
