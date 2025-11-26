export interface AuthResult {
  doctor: Doctor | null;
  lpu: Lpu[];
  area: Area | null;
  personGuid: string;
}

export interface Lpu {
  type: string[];
  full_name: string;
  city: string;
  email: string;
  site: string;
  accessibility: boolean;
  isCallDocHome: boolean;
  isWaitingList: boolean;
  latitude: string;
  longitude: string;
  rating_item?: RatingItem;
  isBlackLabel: boolean;
  id: string;
  title: string;
  code: string;
  children: boolean;
  parent: Parent;
  isChildrenPoliclinic: boolean;
  fullAddress: string;
  worktimes: Worktimes;
  rating?: string;
  phone: string;
}

export interface RatingItem {
  queue: Queue;
  result: Result;
  attitude: Attitude;
  cleanliness: Cleanliness;
}

export interface Queue {
  displayName: string;
  avg: number;
  vote_count: number;
  summa: number;
  detail_1: number;
  detail_2: number;
  detail_3: number;
  detail_4: number;
  detail_5: number;
}

export interface Result {
  displayName: string;
  avg: number;
  vote_count: number;
  summa: number;
  detail_1: number;
  detail_2: number;
  detail_3: number;
  detail_4: number;
  detail_5: number;
}

export interface Attitude {
  displayName: string;
  avg: number;
  vote_count: number;
  summa: number;
  detail_1: number;
  detail_2: number;
  detail_3: number;
  detail_4: number;
  detail_5: number;
}

export interface Cleanliness {
  displayName: string;
  avg: number;
  vote_count: number;
  summa: number;
  detail_1: number;
  detail_2: number;
  detail_3: number;
  detail_4: number;
  detail_5: number;
}

export interface Parent {
  guid: string;
  name: string;
  mcod: string;
}

export interface Worktimes {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export interface Area {
  name: string;
  number: string;
  type: string;
}

export interface Doctor {
  id: string;
  lpu_code: string;
  name: string;
  lastname: string;
  surname: string;
  position: string;
  department_id: string;
  room: string;
  lpu_name: string;
  lpu_address: string;
  phone?: unknown;
  department: unknown;
}
