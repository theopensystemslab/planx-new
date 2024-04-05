import { Flag, FlagSet } from "@opensystemslab/planx-core/types";

import { ALLOW_LIST } from "./provider";

/**
 * When analytics sessions are created localStorage is checked and if there's
 * data in the store for the flow being viewed the session is marked as "resume"
 * otherwise it's classed as being initialised.
 * https://github.com/theopensystemslab/planx-new/blob/ee7bafda12e7eca120652b0aaec439f73d58068e/editor.planx.uk/src/pages/Preview/Questions.tsx#L92-L107
 */
export type AnalyticsType = "init" | "resume";

/**
 * The log direction is marked as "forwards" when it's found that breadcrumbs are
 * being added, "backwards" when breadcrumbs are removed.
 *
 * When a user decided to "save" or "reset" via options in the flow these are
 * also stored.
 */
export type AnalyticsLogDirection =
  | AnalyticsType
  | "forwards"
  | "backwards"
  | "reset"
  | "save";

export type AllowListKey = (typeof ALLOW_LIST)[number];

/**
 * When a user clicks for more info in certain instances such as clicking "info"
 * viewing the `FileUploadAndLabel` component.
 */
export type HelpClickMetadata = Record<string, string>;

export type SelectedUrlsMetadata = Record<"selectedUrls", string[]>;

export type BackwardsNavigationInitiatorType = "change" | "back";

export type ResultNodeMetadata = {
  flag?: Flag;
  flagSet?: FlagSet;
  displayText?: {
    heading?: string;
    description?: string;
  };
};

/**
 * When users navigate through flows some nodes are automatically answered and
 * are therefore not visible to the user. Tracking 'isAutoAnswered' provides a
 * proxy to what was and wasn't visible to the user when querying.
 */
export type AutoAnswerMetadata = {
  isAutoAnswered?: boolean;
};

export type NodeMetadata = ResultNodeMetadata & AutoAnswerMetadata;

/**
 * When a user chooses to navigate backward the "Target" node i.e. the one
 * being navigated to is captured. In some circumstances this can't be know at
 * the time the action is taken. Example:
 * https://github.com/theopensystemslab/planx-new/blob/ee7bafda12e7eca120652b0aaec439f73d58068e/editor.planx.uk/src/%40planx/components/PropertyInformation/Public.tsx#L192-L195
 */
export type BackwardsTargetMetadata = {
  id?: string;
  type?: string | null;
  title?: string;
};

export type BackwardsNavigationMetadata =
  | Record<"change", BackwardsTargetMetadata>
  | Record<"back", BackwardsTargetMetadata>;

type HelpTextFeedbackMetadata = Record<"helpTextUseful", boolean>;

/**
 * Describes the possible values that can be written to analytics_logs.metadata
 * by any one of the specific tracking event functions
 */
export type Metadata =
  | NodeMetadata
  | BackwardsNavigationMetadata
  | SelectedUrlsMetadata
  | HelpClickMetadata
  | HelpTextFeedbackMetadata;

/**
 * Discriminated union to describe the potential data required for tracking
 * analytics events with the `trackEvent` function.
 */
export type EventData =
  | HelpClick
  | NextStepsClick
  | BackwardsNavigation
  | FlowDirectionChange
  | InputErrors
  | HelpTextFeedback;

/**
 * Capture when a user clicks on the `More Information` i.e. the help on a
 * question. The mutation directly applies "has_clicked_help: true" although
 * this can accept metadata as a currently if a user select `info` on a file
 * requirement that data can be stored in this field.
 */
type HelpClick = {
  event: "helpClick";
  metadata: HelpClickMetadata;
};

/**
 * A user gets to a `NextSteps` component. Track every time a user selects a
 * link and appends it to the array.
 */
type NextStepsClick = {
  event: "nextStepsClick";
  metadata: SelectedUrlsMetadata;
};

/**
 * A user selects either `Back` of `Change` this event it triggered which if
 * the `nodeId` is available the `metadata` will be updated with the type of
 * backwards navigation i.e. `back` or `change` and the value is data about
 * the node which will be navigated to.
 */
type BackwardsNavigation = {
  event: "backwardsNavigation";
  metadata: null;
  initiator: BackwardsNavigationInitiatorType;
  nodeId?: string;
};

/**
 * When being used in the context of a tracking event:
 * - 'reset': a user restarts by clicking the 'reset' button
 * - 'save': a user ends a session by saving
 */
type FlowDirectionChange = {
  event: "flowDirectionChange";
  metadata: null;
  flowDirection: AnalyticsLogDirection;
};

/**
 * Captures when a user encounters an error as caught by the ErrorWrapper
 * appends the error message to an array of errors
 */
type InputErrors = {
  event: "inputErrors";
  metadata: null;
  error: string;
};

/**
 * Captures when a user opens the help text and then gives feedback by selecting
 * either "yes" or "no" to whether it helped answer their question.
 */
type HelpTextFeedback = {
  event: "helpTextFeedback";
  metadata: HelpTextFeedbackMetadata;
};
