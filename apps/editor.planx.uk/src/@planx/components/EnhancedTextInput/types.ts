import { BaseNodeData } from "../shared";
import type { PublicProps } from "../shared/types";

/**
 * Common structure for enhancement metadata
 */
export interface EnhancementData {
  original: string;
  enhanced: string;
}

export const TaskActionMap = {
  retainedOriginal: "Retained their original description",
  acceptedEnhanced: "Accepted the AI-enhanced description",
  hybrid: "Re-wrote their description after AI feedback",
} as const;

/**
 * Standard action types for tasks with enhancements
 */
export type TaskAction = keyof typeof TaskActionMap;

/**
 * Human-readable descriptions of TaskActions (used for analytics)
 */
export type TaskActionDescription = (typeof TaskActionMap)[TaskAction];

/**
 * Helper to create a properly typed task definition
 */
type CreateTask<
  TFn extends string,
  TEditorProps extends Record<string, unknown>,
> = {
  editorProps: { fn: TFn } & TEditorProps;
  breadcrumbData: {
    [K in TFn]: string;
  } & {
    [K in `enhancedTextInput.${TFn}.action`]: TaskActionDescription;
  } & {
    _enhancements: {
      [K in TFn]: EnhancementData;
    };
  };
};

/**
 * Registry of all tasks, including their inputs (editorProps) and outputs (breadcrumbData)
 * Used as source of truth from which to derive other types
 */
export type TaskRegistry = {
  projectDescription: CreateTask<
    "project.description",
    {
      revisionTitle: string;
      revisionDescription: string;
    }
  >;
  // TODO: other tasks here!
};

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
  [K in Task]: TaskRegistry[K]["breadcrumbData"];
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
  [K in Task]: React.ComponentType<
    PublicProps<EnhancedTextInputForTask<K>>
  > | null;
};
