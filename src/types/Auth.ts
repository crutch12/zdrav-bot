export interface Department {
  nid: string;
  title: string;
  code: string;
  uid: string;
  created_at: string;
  updated_at: string;
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
  phone?: any;
  department: Department;
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

export interface Lpu {
  id: string;
  external_id?: any;
  med_inst_type_id: string;
  territory_id?: any;
  region: string;
  full_title: string;
  title: string;
  department_name: string;
  phones: string;
  ogrn?: any;
  mcod: string;
  address: string;
  child: string;
  aid_cases?: any;
  management_info: string;
  requisits: string;
  dispanser: string;
  dependancy?: any;
  departments_info?: any;
  price_list?: any;
  contacts?: any;
  worktime: string;
  has_ambulance: string;
  has_trauma: string;
  photo_fid?: any;
  children_polyclinic: string;
  latitude: string;
  longitude: string;
  active: string;
  code: string;
  worktimes: Worktimes;
  email: string;
  phone: string;
  site: string;
  rating: number;
  city_id: string;
  uid: string;
  accessibility: string;
  children: string;
  is_call_doctor_home: string;
  is_waiting_list: string;
  created_at?: any;
  updated_at: string;
  med_inst_types: string;
}

export interface Area {
  name: string;
  number: string;
  type: string;
}

export interface Items {
  doctor: Doctor;
  lpu: Lpu[];
  area: Area;
  personGuid: string;
}

export interface Post {
  sPol?: any;
  nPol: string;
  pol: string;
  birthday: string;
}

export interface AuthResult {
  code: number;
  message: string;
  items?: Items;
  success?: boolean;
  post?: Post;
}
