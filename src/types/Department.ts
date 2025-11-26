export interface DepartmentsResult {
  items: Item[];
}

export interface Item {
  id: string;
  title: string;
  code: string;
  volume: number;
  isWaitingList: boolean;
}
