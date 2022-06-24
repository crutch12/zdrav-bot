export interface Item {
  id: string;
  title: string;
  code: string;
  volume: number;
  isWaitingList: boolean;
}

export interface DepartmentsResult {
  code: number;
  message: string;
  success: boolean;
  items: Item[];
}
