import { BaseNodeData } from "../shared";
import type { PublicProps } from "../shared/types";

export interface TaskDefinition {
  editorProps: { fn: string } & Record<string, unknown>;
  breadcrumbData: Record<string, unknown>;
}

/**
 * Type guard to ensure any new tasks added to the registry conform to the above type
 */
type ValidateRegistry<T extends Record<string, TaskDefinition>> = T;

/**
 * Registry of all task, including their inputs (editorProps) and outputs (breadcrumbData)
 * Used as source of truth from which to derive other types
 */
export type TaskRegistry = ValidateRegistry<{
  projectDescription: {
    editorProps: {
      fn: "project.description";
      // TODO: Based on UI, decide on props
      revisionTitle: string;
      revisionDescription: string;
    };
    breadcrumbData: {
      original: string;
      suggested?: string;
      userAction: "retainedOriginal" | "acceptedSuggested" | "hybrid";
    };
  };
  // TODO: other tasks here!
}>

export type Task = keyof TaskRegistry;

export interface BaseEnhancedTextInput extends BaseNodeData {
  title: string;
  description?: string;
}

/**
 * Database representation of an EnhancedTextInput component
 * BaseBaseEnhancedTextInput + Task
 */
export type EnhancedTextInput = BaseEnhancedTextInput &
  {
    [K in Task]: { task: K } & TaskRegistry[K]["editorProps"];
  }[Task];

/**
 * Output of an EnhancedTextInput component
 */
export type BreadcrumbData = {
  [K in Task]: { task: K } & TaskRegistry[K]["breadcrumbData"];
}[Task];

/** Helper to type-narrow a breadcrumb */
export type BreadcrumbDataForTask<T extends Task> = {
  task: T;
} & TaskRegistry[T]["breadcrumbData"];

/** Helper to type-narrow an EnhancedTextInput */
export type EnhancedTextInputForTask<T extends Task> = EnhancedTextInput & {
  task: T;
} & TaskRegistry[T]["editorProps"];

/** Default values used to populate initial form values */
export type TaskDefaults = { [K in Task]: TaskRegistry[K]["editorProps"] };

/**
 * Map of tasks to public components
 * Allows individual components to handle type-narrowed Tasks
 */
export type TaskComponentMap = {
  [K in Task]: React.ComponentType<PublicProps<EnhancedTextInputForTask<K>>> | null;
};