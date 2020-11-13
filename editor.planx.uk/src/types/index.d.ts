interface BaseNode {
  /**
   * A human-readable label for distinguishing the
   * node when it is shown in the graph editor.
   */
  label?: string;
  /**
   * The schema version of the node.
   *
   * @minimum 1
   * @default 1
   */
  version: number;
  data?: object;
  edges?: Array<string>;
}

export interface Checklist extends BaseNode {
  data: {
    /**
     * Determines whether or not the user must select
     * all of the available options for this checklist.
     */
    allRequired?: boolean;
    description?: string;
    fn?: string;
    img?: string;
    notes?: string;
    text?: string;
  };
}

export interface Notice extends BaseNode {
  data: {
    /**
     * A string (e.g. white) or hex-code (e.g. #FFFFFF) of the
     * background-color to use when displaying this notice.
     */
    color: string;
    description: string;
    notes?: string;
    resetButton?: boolean;
  };
}

export interface Page extends BaseNode {
  data: {
    title: string;
  };
}

export type FlowNode = Checklist | Notice;

export type Flow = Map<string, FlowNode>;
