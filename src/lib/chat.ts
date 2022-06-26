import axios from 'axios';
import * as https from 'https';

import { Command } from '../types/Command';
import { AuthResult } from '../types/Auth';
import { DoctorsQuery } from '../services/doctors';
import { createChat, getChat, getSubscriptions, removeSubscription, setSubscription, updateChat } from '../db';
import setCookie from 'set-cookie-parser';
import { authByPolis } from '../services/auth';

export type Polis = {
  birthday: string;
  nPol: string;
  pol: string;
  sPol: string;
  auth: boolean;
};

const BASE_URL = 'https://uslugi.mosreg.ru';

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

  private _polis?: Polis;
  private _authResult?: AuthResult;
  private _subscriptions: Subscription[];
  private _initialCookies?: string[];

  public constructor(
    userId: number,
    props: { polis?: Polis; authResult?: AuthResult; subscriptions?: Subscription[]; initialCookies?: string[] },
  ) {
    this.userId = userId;
    this.lastCommand = Command.UNKNOWN;

    this._subscriptions = props.subscriptions || [];
    this._polis = props.polis || undefined;
    this._authResult = props.authResult || undefined;
    this._initialCookies = props.initialCookies || undefined;
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

  private get initialAuthCookie() {
    if (!this._initialCookies) return undefined;

    const parsedCookies = setCookie.parse(this._initialCookies);
    return parsedCookies.map((parsedCookie) => `${parsedCookie.name}=${parsedCookie.value}`).join('; ');
  }

  public get axios() {
    const authCookie =
      this.authResult && this.polis
        ? [
            this.initialAuthCookie,
            `da_sPol=`,
            `da_nPol=${this.polis.pol}`,
            `da_birthday=${this.polis.birthday}`,
            `da_auth=true`,
            `polis_login_failed=0`,
          ]
            .filter(Boolean)
            .join('; ')
        : null;

    return axios.create({
      baseURL: BASE_URL,
      httpAgent: new https.Agent({ rejectUnauthorized: false }),
      headers: {
        'User-Agent': 'PostmanRuntime/7.28.4',
        Cookie: authCookie || this.initialAuthCookie || null,
      },
    });
  }

  public get polis() {
    return this._polis;
  }

  public get authResult() {
    return this._authResult;
  }

  public async getInitialSessionCookie() {
    const { headers } = await this.axios.get('/zdrav/', { headers: { Cookie: null } });
    this.setInitialCookies(headers['set-cookie']);
    return this._initialCookies;
  }

  public setPolis(polis: Polis) {
    this._polis = polis;
  }

  public setInitialCookies(initialCookies: string[]) {
    this._initialCookies = initialCookies;
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

  public get cookieExpired() {
    if (!this._initialCookies || !this._initialCookies.length) return true;
    const cookies = this._initialCookies.map((cookie) => setCookie.parseString(cookie));
    return cookies.filter((cookie) => cookie.expires < new Date()).some(Boolean);
  }

  public async revalidate() {
    const initialCookies = await this.getInitialSessionCookie();
    const authResult = await authByPolis(this);

    await updateChat(this, {
      authResult,
      initialCookies,
    });

    return this;
  }
}
