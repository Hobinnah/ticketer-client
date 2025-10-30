import type { User } from "./User";

export default class Task {
  taskID!: string; // GUID as string
  title: string = '';
  description: string = '';
  status: string = 'Pending';
  createdBy: string = '';
  createdAt?: Date | null;
  dueDate?: Date | null;
  completedAt?: Date | null;

  userID!: number;
  user?: User | null;

  constructor(init?: Partial<Task>) {
    Object.assign(this, init);
  }
}
