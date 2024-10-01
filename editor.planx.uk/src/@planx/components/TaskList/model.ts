import type { BaseNodeData } from "../shared";
import { parseBaseNodeData } from "../shared";

export interface TaskList extends BaseNodeData {
  title: string;
  description?: string;
  tasks: Array<Task>;
  /**
   * @deprecated Remove once migrated
   */
  taskList?: {
    tasks: Array<Task>;
  };
}

export interface Task {
  title: string;
  description: string;
}

export const parseTaskList = (
  data: Record<string, any> | undefined,
): TaskList => ({
  tasks: data?.taskList?.tasks || data?.tasks || [],
  title: data?.title || "",
  description: data?.description || "",
  ...parseBaseNodeData(data),
});
