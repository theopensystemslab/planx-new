import { richText } from "lib/yupExtensions";
import { array, object, string } from "yup";

import type { BaseNodeData } from "../shared";
import { baseNodeDataValidationSchema, parseBaseNodeData } from "../shared";

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

const taskSchema = object({
  title: string().required("Title is a required filed"),
  description: richText(),
});

export const validationSchema = baseNodeDataValidationSchema.concat(
  object({
    title: string().required(),
    description: richText(),
    tasks: array(taskSchema).required().min(1),
    taskList: object({
      tasks: array(taskSchema).min(1),
    }).optional(),
  }),
);
