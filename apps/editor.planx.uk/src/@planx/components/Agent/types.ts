import { BaseNodeData } from "../shared";
import type { PublicProps } from "../shared/types";

/**
 * Registry of all task, including their inputs (editorProps) and outputs (breadcrumbData)
 * Used as source of truth from which to derive other types
 */
export interface TaskRegistry {
  enhanceProjectDescription: {
    editorProps: {
      abc?: string;
    };
    breadcrumbData: {
      original: string;
      suggested?: string;
      userAction: "retainedOriginal" | "acceptedSuggested" | "hybrid";
    };
  };
  validateDrawings: {
    editorProps: {
      def?: string;
    };
    breadcrumbData: {
      ghi?: string;
    };
  };
}

export type Task = keyof TaskRegistry;

export interface BaseAgent extends BaseNodeData {
  fn?: string;
  title: string;
  description?: string;
}

/**
 * Database representation of an Agent component
 * BaseAgent + Task
 */
export type Agent = BaseAgent &
  {
    [K in Task]: { task: K } & TaskRegistry[K]["editorProps"];
  }[Task];

/**
 * Output of an agent component
 */
export type BreadcrumbData = {
  [K in Task]: { task: K } & TaskRegistry[K]["breadcrumbData"];
}[Task];

/** Helper to type-narrow a breadcrumb */
export type BreadcrumbDataForTask<T extends Task> = {
  task: T;
} & TaskRegistry[T]["breadcrumbData"];

/** Helper to type-narrow an agent */
export type AgentForTask<T extends Task> = BaseAgent & {
  task: T;
} & TaskRegistry[T]["editorProps"];

/** Default values used to populate initial form values */
export type TaskDefaults = { [K in Task]: TaskRegistry[K]["editorProps"] };

/**
 * Map of tasks to public components
 * Allows individual components to handle type-narrowed Tasks
 */
export type TaskComponentMap = {
  [K in Task]: React.ComponentType<PublicProps<AgentForTask<K>>> | null;
};
