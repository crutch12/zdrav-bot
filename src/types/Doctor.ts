export interface DoctorsResult {
  items: Item[];
}

export interface Item {
  lpu_code: string;
  uchastok: Uchastok | null;
  lpu: Lpu;
  doctors: Doctor[];
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

export interface Doctor {
  schedule: Schedule[];
  closestEntry?: ClosestEntry;
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
  positionCode: string;
  department: string;
  room: string;
  isWaitingList: boolean;
  isSpecial: boolean;
  snils: unknown;
  birthday: unknown;
  phone: unknown;
  sex: unknown;
  description: string;
  separation: string;
  rating: string;
  photo: string;
  equipment: unknown;
  lpu: unknown;
  uchastokName: string;
}

export interface Schedule {
  date: string;
  time_from: string;
  time_to: string;
  docBusyType: DocBusyType;
  count_tickets: number;
}

export interface DocBusyType {
  name: string;
  type: number;
  code: string;
}

export interface ClosestEntry {
  timeTableGuid: string;
  beginTime: string;
}

export interface Uchastok {
  name: string;
  code: string;
  docPrvd: string;
}
