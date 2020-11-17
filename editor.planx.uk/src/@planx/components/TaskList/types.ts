import { MoreInformation } from "../shared";

export interface TaskList extends MoreInformation {
  tasks: Array<Task>;
}

export interface Task {
  title: string;
  description: string;
}
