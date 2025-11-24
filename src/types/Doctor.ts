/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Uchastok {
  name: string;
  code: string;
  docPrvd: string;
}

export interface Lpu {
  guid: string;
  oid: string;
  name: string;
  address: string;
  phone: string;
  mcod: string;
  recipe: boolean;
  wlist: boolean;
}

export interface DocBusyType {
  name: string;
  type: number;
  code: string;
}

export interface Formatting {
  day: string;
  date: string;
  time_from: string;
  time_to: string;
  count_tickets: number;
}

export interface Schedule {
  date: string;
  time_from: string;
  time_to: string;
  docBusyType: DocBusyType;
  count_tickets: number;
  date_short: string;
  day: string;
  formatting: Formatting;
}

export interface DocBusyType2 {
  name: string;
  type: number;
  code: string;
}

export interface Formatting2 {
  day: string;
  date: string;
  time_from: string;
  time_to: string;
  count_tickets: number;
}

export interface Week1 {
  date: string;
  time_from: string;
  time_to: string;
  docBusyType: DocBusyType2;
  count_tickets: number;
  date_short: string;
  day: string;
  formatting: Formatting2;
}

export interface DocBusyType3 {
  name: string;
  type: number;
  code: string;
}

export interface Formatting3 {
  day: string;
  date: string;
  time_from: string;
  time_to: string;
  count_tickets: number;
}

export interface Week2 {
  date: string;
  time_from: string;
  time_to: string;
  docBusyType: DocBusyType3;
  count_tickets: number;
  date_short: string;
  day: string;
  formatting: Formatting3;
}

export interface Doctor {
  schedule: Schedule[];
  separation: string;
  rating: number;
  photo: string;
  equipment?: any;
  lpu?: any;
  id: string;
  displayName: string;
  person_id: string;
  lpu_code: string;
  type: number;
  type_name: string;
  name: string;
  family: string;
  surname: string;
  position: string;
  department: string;
  room: string;
  isWaitingList: boolean;
  isSpecial: boolean;
  snils: string;
  birthday: Date;
  count_tickets: number;
  week1: Week1[];
  week2: Week2[];
}

export interface CountTickets {
  week1: number;
  week2: number;
}

export interface Item {
  lpu_code: string;
  uchastok: Uchastok;
  lpu: Lpu;
  doctors: Doctor[];
  iswaiting: string;
  count_tickets_lpu: number;
  count_tickets: CountTickets;
}

export interface DoctorsResult {
  code: number;
  items: Item[];
}
