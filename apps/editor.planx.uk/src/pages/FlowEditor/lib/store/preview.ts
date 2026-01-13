import type {
  Address,
  Flag,
  FlagSet,
  GovUKPayment,
  Node,
  NodeId,
  Value,
} from "@opensystemslab/planx-core/types";
import {
  ComponentType,
  ComponentType as TYPES,
  DEFAULT_FLAG_CATEGORY,
  flatFlags,
} from "@opensystemslab/planx-core/types";
import { getNoResultFlag } from "@opensystemslab/planx-core/types";
import { Contact } from "@planx/components/ContactInput/model";
import { FileList } from "@planx/components/FileUploadAndLabel/model";
import { DEFAULT_FN as planningConstraintsFn } from "@planx/components/PlanningConstraints/model";
import { SetValue } from "@planx/components/SetValue/model";
import { handleSetValue } from "@planx/components/SetValue/utils";
import { sortIdsDepthFirst } from "@planx/graph";
import { logger } from "airbrake";
import { objectWithoutNullishValues } from "lib/objectHelpers";
import isEqual from "lodash/isEqual";
import omit from "lodash/omit";
import pick from "lodash/pick";
import uniq from "lodash/uniq";
import { v4 as uuidV4 } from "uuid";
import type { StateCreator } from "zustand";

import type { Session } from "../../../../types";
import { ApplicationPath } from "../../../../types";
import type { Store } from ".";
import { NavigationStore } from "./navigation";
import type { SharedStore } from "./shared";

const SUPPORTED_DECISION_TYPES = [TYPES.Checklist, TYPES.Question];
const SUPPORTED_INPUT_TYPES = [
  TYPES.AddressInput,
  TYPES.ContactInput,
  TYPES.DateInput,
  TYPES.NumberInput,
  TYPES.TextInput,
];

let memoizedPreviousCardId: string | undefined = undefined;
let memoizedBreadcrumb: Store.Breadcrumbs | undefined = undefined;

export interface Response {
  question: Node & { id: NodeId };
  selections: Array<Node & { id: NodeId }>;
  hidden: boolean;
}

interface ResultData {
  [category: string]: {
    flag: Flag;
    responses: Array<Response>;
    displayText: { heading: string; description: string };
  };
}

interface CollectedFlags {
  [category: string]: Array<Flag["text"] | undefined>;
}

export interface AutoAnswerableInputMap {
  [TYPES.AddressInput]: Address;
  [TYPES.ContactInput]: Contact;
  [TYPES.DateInput]: string;
  [TYPES.NumberInput]: number;
  [TYPES.TextInput]: string;
}

export interface PreviewStore extends Store.Store {
  collectedFlags: () => CollectedFlags;
  currentCard: ({ id: NodeId } & Store.Node) | null;
  setCurrentCard: () => void;
  getCurrentCard: () => ({ id: NodeId } & Store.Node) | null;
  hasPaid: () => boolean;
  previousCard: (
    node: Store.Node | null,
    upcomingCardIds?: NodeId[],
  ) => NodeId | undefined;
  canGoBack: (node: Store.Node | null) => boolean;
  getType: (node: Store.Node | null) => TYPES | undefined;
  computePassport: () => Readonly<Store.Passport>;
  record: (id: NodeId, userData?: Store.UserData) => void;
  resultData: (
    flagSet?: string,
    overrides?: {
      [flagId: string]: { heading?: string; description?: string };
    },
  ) => ResultData;
  resumeSession: (session: Omit<Session, "passport">) => void;
  sessionId: string;
  upcomingCardIds: () => NodeId[];
  isFinalCard: () => boolean;
  govUkPayment?: GovUKPayment;
  setGovUkPayment: (govUkPayment: GovUKPayment) => void;
  cachedBreadcrumbs?: Store.CachedBreadcrumbs;
  analyticsId?: number;
  setAnalyticsId: (analyticsId: number) => void;
  restore: boolean;
  changeAnswer: (id: string) => void;
  changedNode: string | undefined;
  _nodesPendingEdit: string[];
  path: ApplicationPath;
  saveToEmail?: string;
  overrideAnswer: (fn: string) => void;
  requestedFiles: () => FileList;
  autoAnswerableInputs: <T extends keyof AutoAnswerableInputMap>(
    id: NodeId,
  ) => AutoAnswerableInputMap[T];
  autoAnswerableOptions: (id: NodeId) => Array<NodeId> | undefined;
  autoAnswerableFlag: (filterId: NodeId) => NodeId | undefined;
  hasAcknowledgedWarning: boolean;
  setHasAcknowledgedWarning: () => void;
}

export const previewStore: StateCreator<
  SharedStore & PreviewStore & NavigationStore,
  [],
  [],
  PreviewStore
> = (set, get) => ({
  setAnalyticsId(analyticsId) {
    set({ analyticsId });
  },

  setGovUkPayment(govUkPayment) {
    set({ govUkPayment });
  },

  // XXX: This function assumes there's only one "Review" component per flow.
  changeAnswer(id: string) {
    const { record } = get();
    set({ changedNode: id });
    record(id, undefined);
  },

  collectedFlags() {
    const { breadcrumbs, flow } = get();
    const collectedFlags: CollectedFlags = {};

    const categories = [...new Set(flatFlags.map((flag) => flag.category))];
    categories.forEach((category) => {
      const flagValues = collectedFlagValuesByCategory(
        category,
        breadcrumbs,
        flow,
      );
      let flagText: (string | undefined)[] = [];
      if (flagValues.length > 0) {
        flagText = flagValues.map(
          (flagValue) =>
            flatFlags.find((flag) => flag.value === flagValue)?.text,
        );
      }
      collectedFlags[category] = flagText;
    });

    return collectedFlags;
  },

  setCurrentCard() {
    const { upcomingCardIds, flow } = get();
    const upcoming = upcomingCardIds();

    if (upcoming.length > 0) {
      const id = upcoming[0];
      set({ currentCard: { id, ...flow[id] } });
    } else {
      set({ currentCard: null });
    }
  },

  hasPaid: () => {
    const { breadcrumbs, flow } = get();

    return Object.entries(breadcrumbs).some(
      ([id, userData]) => flow[id]?.type === TYPES.Pay && !userData.auto,
    );
  },

  previousCard: (node: Store.Node | null) => {
    const { breadcrumbs, flow, _nodesPendingEdit, changedNode } = get();
    const goBackable = Object.entries(breadcrumbs)
      .filter(([, v]) => !v.auto)
      .map(([k]) => k);
    if (changedNode && node?.id === changedNode) return;

    if (_nodesPendingEdit.length || goBackable.length <= 1) {
      return goBackable.pop();
    }

    let previousCardId = memoizedPreviousCardId;

    const shouldUpdateMemoizedValues =
      !previousCardId || !isEqual(memoizedBreadcrumb, breadcrumbs);

    // XXX: The functions `upcomingCardIds()` and `sortIdsDepthFirst()` are computationally heavy,
    //      so we should call them only when needed to prevent UI slowness.
    if (node?.id && shouldUpdateMemoizedValues) {
      memoizedBreadcrumb = breadcrumbs;
      const sorted = sortIdsDepthFirst(flow)(new Set([node.id, ...goBackable]));
      const currentCardIndex = sorted.indexOf(node.id);
      previousCardId =
        currentCardIndex > 0 ? sorted[currentCardIndex - 1] : sorted[0];
      memoizedPreviousCardId = previousCardId;
    }

    return previousCardId;
  },

  canGoBack: (node: Store.Node | null) => {
    // XXX: node is a required param until upcomingNodes().shift() is
    //      optimised/memoized, see related isFinalCard() comment below
    const { hasPaid, previousCard } = get();
    return Boolean(node?.id) && Boolean(previousCard(node)) && !hasPaid();
  },

  getType: (node: Store.Node | null) => {
    const { flow } = get();
    if (!node?.id) return;
    const currentNodeType = flow[node.id]?.type;
    return currentNodeType;
  },

  computePassport: () => {
    const { flow, breadcrumbs } = get();
    const passport = Object.entries(breadcrumbs).reduce(
      (acc, [id, { data = {}, answers = [] }]) => {
        if (!flow[id]) return acc;

        const key = flow[id].data?.fn;

        const passportData: Store.Passport["data"] = {};

        if (key) {
          const passportValue = answers
            .map((id: string) => flow[id]?.data?.val)
            .filter(
              (val) =>
                val !== undefined && val !== null && String(val).trim() !== "",
            );

          if (passportValue.length > 0) {
            const existingValue = acc.data?.[key] ?? [];

            const combined =
              key === planningConstraintsFn
                ? passportValue.concat(existingValue) // Planning constraints uniquely store all-levels of granularity, rather than most granular only
                : passportValue
                    .concat(existingValue)
                    .reduce(
                      (
                        acc: string[],
                        curr: string,
                        _i: number,
                        arr: string[],
                      ) => {
                        if (
                          !arr.some((x) => x !== curr && x?.startsWith(curr))
                        ) {
                          acc.push(curr);
                        }
                        return acc;
                      },
                      [],
                    );

            passportData[key] = uniq(combined);
          }
        }

        const responseData = Object.entries(data).reduce(
          (_acc, [id, value]) => {
            _acc![id] = value;
            return _acc;
          },
          {} as Store.Passport["data"],
        );

        let passport: Store.Passport = {
          ...acc,
          data: {
            ...acc.data,
            ...responseData,
            ...passportData,
          },
        };

        const isSetValue = flow[id].type === TYPES.SetValue;
        if (isSetValue) {
          passport = handleSetValue({
            nodeData: flow[id].data as SetValue,
            previousValues: acc.data?.[key],
            passport,
          });
        }

        return passport;
      },
      {
        data: {},
      } as Store.Passport,
    );

    return passport;
  },

  // record() notably handles removing cachedBreadcrumbs for dependent component types
  //   ie if you 'go back' to change your address, `DEPENDENT_TYPES` shouldn't be retained because they reference the property site passport, but answers to other questions can be retained
  record(id, userData) {
    const {
      breadcrumbs,
      flow,
      restore,
      cachedBreadcrumbs,
      _nodesPendingEdit,
      changedNode,
      updateSectionData,
      setCurrentCard,
    } = get();

    if (!flow[id]) throw new Error(`id "${id}" not found`);

    if (userData) {
      // add breadcrumb
      const { answers = [], data = {}, auto = false, override } = userData;

      const breadcrumb: Store.UserData = {
        auto: Boolean(auto),
        createdAt: new Date().toISOString(),
        seq: Object.keys(breadcrumbs).length + 1,
      };
      if (answers?.length > 0) breadcrumb.answers = answers;

      const filteredData = objectWithoutNullishValues(data);
      if (Object.keys(filteredData).length > 0) breadcrumb.data = filteredData;

      if (override) {
        const filteredOverride = objectWithoutNullishValues(override);
        if (Object.keys(filteredOverride).length > 0)
          breadcrumb.override = filteredOverride;
      }

      let cacheWithoutOrphans = removeOrphansFromBreadcrumbs({
        id,
        flow,
        userData: breadcrumb,
        breadcrumbs: cachedBreadcrumbs,
      });

      const { newBreadcrumbs, nodesPendingEdit } = handleNodesWithPassport({
        id,
        flow,
        cachedBreadcrumbs: cacheWithoutOrphans,
        userData: breadcrumb,
        currentNodesPendingEdit: _nodesPendingEdit,
        breadcrumbs,
      });

      cacheWithoutOrphans = newBreadcrumbs;
      delete cacheWithoutOrphans?.[id];

      const nextBreadcrumbs = {
        ...breadcrumbs,
        ...(restore ? cacheWithoutOrphans : {}),
        [id]: breadcrumb,
      };

      // Key order matters because it's the order in which components are displayed in the Review component
      const sortedBreadcrumbs = sortBreadcrumbs(
        nextBreadcrumbs,
        flow,
        nodesPendingEdit,
      );

      const shouldRemovedChangedNode = Object.keys(nextBreadcrumbs).some(
        (key) => flow[key]?.type === TYPES.Review,
      );

      set({
        breadcrumbs: sortedBreadcrumbs,
        cachedBreadcrumbs: { ...(restore ? {} : cacheWithoutOrphans) }, // clean cache if restore is true (i.e. if user has changed their answer)
        restore: false,
        _nodesPendingEdit: nodesPendingEdit,
        changedNode: shouldRemovedChangedNode ? undefined : changedNode,
      });
    } else {
      // remove breadcrumbs that were stored from id onwards because user has 'gone back'
      const breadcrumbIds = Object.keys(breadcrumbs);
      const idx = breadcrumbIds.indexOf(id);
      const remainingBreadcrumbs = pick(
        breadcrumbs,
        breadcrumbIds.slice(0, idx),
      );
      const removedBreadcrumbs = pick(breadcrumbs, breadcrumbIds.slice(idx));

      if (idx >= 0) {
        set({
          breadcrumbs: remainingBreadcrumbs,
          cachedBreadcrumbs: {
            ...removedBreadcrumbs,
            ...cachedBreadcrumbs,
          },
        });
      }
    }
    setCurrentCard();

    updateSectionData();
  },

  resultData(flagSet, overrides) {
    const { breadcrumbs, flow } = get();
    const category = flagSet || DEFAULT_FLAG_CATEGORY;

    const possibleFlags: Flag[] = flatFlags.filter(
      (flag) => flag.category === category,
    );
    const collectedFlags = collectedFlagValuesByCategory(
      category,
      breadcrumbs,
      flow,
    );

    // The highest order flag collected in this category is our result, else mock "No result"
    const flag: Flag =
      possibleFlags.find((f) => f.value === collectedFlags[0]) ||
      getNoResultFlag(category as FlagSet);

    // Get breadcrumb nodes that set the result flag value (limited to Question & Checklist types)
    const responses = Object.entries(breadcrumbs)
      .map(([nodeId, { answers = [] }]) => {
        const question = { id: nodeId, ...flow[nodeId] };
        const questionType = question?.type;
        if (!questionType || !SUPPORTED_DECISION_TYPES.includes(questionType))
          return null;

        const selections = answers.map((answerId) => ({
          id: answerId,
          ...flow[answerId],
        }));
        const hidden = !selections.some(
          (selection) =>
            selection.data?.flags && selection.data.flags.includes(flag?.value),
        );

        return {
          question,
          selections,
          hidden,
        };
      })
      .filter(Boolean);

    // Get the heading & description for this result flag
    const heading =
      (flag.value && overrides && overrides[flag.value]?.heading) || flag.text;
    const description =
      (flag.value && overrides && overrides[flag.value]?.description) ||
      category;

    return {
      [category]: {
        flag,
        displayText: { heading, description },
        responses: responses.every((response) => Boolean(response?.hidden))
          ? responses.map((response) => ({ ...response, hidden: false }))
          : responses,
      },
    } as ResultData;
  },

  resumeSession(session) {
    // Hasura sorts JSONB data alphabetically by key value on insert/update
    // It is vital that we always re-sort breadcrumbs data (by flow depth) on resume
    // Without this, the user's passport will not generate correctly
    const sortedBreadcrumbs = sortBreadcrumbs(session.breadcrumbs, get().flow);

    set({ ...session, breadcrumbs: sortedBreadcrumbs });
    get().setCurrentCard();
    get().updateSectionData();
  },

  sessionId: uuidV4(),

  upcomingCardIds() {
    const { flow, breadcrumbs } = get();

    const ids: Set<NodeId> = new Set();

    // Based on a given node, get the nodes we should navigate through next: the children of any selected options, as well as nodes on the _root graph that should be seen no matter which option is selected
    const nodeIdsConnectedFrom = (source: NodeId): void => {
      return (flow[source]?.edges ?? [])
        .filter((id) => {
          // Filter out nodes we've already visited (aka have a breadcrumb for) (eg clones)
          const node = flow[id];
          return node && !breadcrumbs[id];
        })
        .forEach((id) => {
          const node = flow[id];

          // Recursively get children in internal portals
          if (node.type === TYPES.InternalPortal) {
            return nodeIdsConnectedFrom(id);
          }

          ids.add(id);
        });
    };

    // With a guaranteed unique set
    new Set(
      // of all the answers collected so far
      Object.values(breadcrumbs)
        // in reverse order
        .flatMap(({ answers }) => answers as Array<NodeId>)
        // .filter(Boolean)
        .reverse()
        // ending with _root
        .concat("_root"),
      // run nodeIdsConnectedFrom(answerId)
    ).forEach(nodeIdsConnectedFrom);

    // Then return an array of the upcoming node ids, in depth-first order
    return sortIdsDepthFirst(flow)(ids);
  },

  autoAnswerableInputs: (id: NodeId) => {
    const { breadcrumbs, flow } = get();

    const node = flow[id];
    if (!node) return;

    const { type, data } = node;
    if (!type || !SUPPORTED_INPUT_TYPES.includes(type) || !data?.fn) return;

    // Auto-answer supported input component types when another component of
    //   the exact same type and data field has been previously seen by the user
    const visitedNodes = Object.entries(breadcrumbs)
      .filter(
        ([nodeId, breadcrumb]) =>
          flow[nodeId]?.type === type &&
          flow[nodeId]?.data?.fn === data.fn &&
          breadcrumb.auto === false,
      )
      .map(([nodeId, _breadcrumb]) => nodeId);

    if (!visitedNodes.length) return;

    const autoAnswerableInputValue =
      type === ComponentType.ContactInput
        ? breadcrumbs[visitedNodes[0]].data?.[`_contact.${data.fn}`]?.[data.fn]
        : breadcrumbs[visitedNodes[0]].data?.[data.fn];

    return autoAnswerableInputValue;
  },

  /**
   * Questions and Checklists auto-answer based on passport values
   * @param id - id of the Question or Checklist node
   * @returns - list of ids of the Answer nodes which can auto-answered (max length 1 for Questions)
   */
  autoAnswerableOptions: (id: NodeId) => {
    const { breadcrumbs, flow, computePassport } = get();

    const node = flow[id];
    if (!node) return;

    // Only Question & Checklist nodes that have an fn & edges are eligible for auto-answering
    const { type, data, edges } = node;
    if (
      !type ||
      !SUPPORTED_DECISION_TYPES.includes(type) ||
      !data?.fn ||
      !edges ||
      data?.neverAutoAnswer
    )
      return;

    const passport = computePassport();

    // Only proceed if the user has seen at least one node with this fn before, unless "never put to user (default blank automation)" is toggled on
    const visitedFns = Object.entries(breadcrumbs).filter(
      ([nodeId, _breadcrumb]) =>
        flow[nodeId]?.data?.fn === data.fn ||
        // Account for nodes like FindProperty that don't have `data.fn` prop but still set passport vars like `property.region` etc
        Object.keys(passport?.data || {}).includes(data.fn),
    );
    if (!visitedFns.length && !data?.alwaysAutoAnswerBlank) return;

    // For each visited node, get the data values of its' options (aka edges or Answer nodes)
    const visitedOptionVals: string[] = [];
    visitedFns.forEach(([nodeId, _breadcrumb]) => {
      flow[nodeId]?.edges?.map((edgeId) => {
        if (flow[edgeId].type === TYPES.Answer && flow[edgeId].data?.val) {
          visitedOptionVals.push(flow[edgeId].data.val);
        }
      });
    });

    // Get all options for the current node
    const options: Array<Store.Node> = edges.map((edgeId) => ({
      id: edgeId,
      ...flow[edgeId],
    }));
    const sortedOptions = options
      .sort(
        (a, b) =>
          // Sort by the most to least number of dot-separated items in data.val (most granular to least)
          String(b.data?.val).split(".").length -
          String(a.data?.val).split(".").length,
      )
      // Only keep options with a data value set (remove blanks)
      .filter((option) => option.data?.val);
    const sortedOptionVals: string[] = sortedOptions.map(
      (option) => option.data?.val,
    );
    const hasVisitedEveryOption = sortedOptionVals.every((value) =>
      visitedOptionVals.includes(value),
    );
    const blankOption = options.find((option) => !option.data?.val);

    let optionsThatCanBeAutoAnswered: Array<NodeId> = [];

    // Get existing passport value(s) for this node's fn, accounting for Planning Constraints special `_nots`
    const passportValues = passport.data?.[data.fn];
    const nots: string[] | undefined =
      passport.data?.["_nots"]?.[planningConstraintsFn];

    const foundPassportValues =
      Array.isArray(passportValues) && passportValues.length > 0;

    // If we have existing passport value(s) for this fn in an eligible automation format (eg not numbers or plain strings),
    //   then proceed through the matching option(s) or the blank option independent if other vals have been seen before
    if (foundPassportValues && data.fn !== planningConstraintsFn) {
      // Check if the existing passport value(s) startsWith at least one option's val (eg passport retains most granular values only)
      const matchingPassportValues = passportValues.filter(
        (passportValue: any) =>
          sortedOptions.some((option) =>
            passportValue?.startsWith(option.data?.val),
          ),
      );

      if (matchingPassportValues.length > 0) {
        let foundExactMatch = false;
        sortedOptions.forEach((option) => {
          passportValues.forEach((passportValue: any) => {
            // An option can be auto-answered if it has direct match in the passport
            //   or if the passport has a more granular version of the option (eg option is `fruit`, passport has `fruit.apple`)
            //     but only in cases where we don't also have the exact match
            if (passportValue === option.data?.val) {
              if (option.id) optionsThatCanBeAutoAnswered.push(option.id);
              foundExactMatch = true;
            } else if (
              passportValue.startsWith(option.data?.val) &&
              !foundExactMatch
            ) {
              if (option.id) optionsThatCanBeAutoAnswered.push(option.id);
            }
          });
        });
      } else {
        if (blankOption?.id) {
          optionsThatCanBeAutoAnswered.push(blankOption.id);
        }
      }
    }

    if (data.fn === planningConstraintsFn && (foundPassportValues || nots)) {
      // Planning constraints queried from an external source are stored via two separate passport vars:
      //   - One for intersections aka `planningConstraintsFn`
      //   - Another for not-intersections aka `_nots`
      const matchingIntersectingConstraints = passportValues?.filter(
        (passportValue: any) =>
          sortedOptions.some((option) => passportValue === option.data?.val),
      );
      const matchingNots = nots?.filter((not) =>
        sortedOptions.some((option) => not === option.data?.val),
      );

      if (matchingIntersectingConstraints?.length > 0) {
        // Planning constraints uniquely store passport values for every level of granularity (eg `listed`, `listed.gradeOne`)
        //   So only auto-answer based on exact matches and do not apply `startsWith` logic
        sortedOptions.forEach((option) => {
          passportValues.forEach((passportValue: any) => {
            if (passportValue === option.data?.val) {
              if (option.id) optionsThatCanBeAutoAnswered.push(option.id);
            }
          });
        });
      } else if (matchingNots && matchingNots.length > 0) {
        // Nots are planning constraints that were queried, but do not apply, therefore we automate through the blank
        sortedOptions.forEach((option) => {
          nots?.forEach((not) => {
            if (not === option.data?.val) {
              if (blankOption?.id)
                optionsThatCanBeAutoAnswered.push(blankOption.id);
            }
          });
        });
      } else {
        // If this node is asking about a constraint that we have NOT queried from an external source,
        //   Then put it to the user exactly once and automate future instances of it, unless "never put to user" is toggled on
        if (blankOption?.id)
          if (hasVisitedEveryOption || data?.alwaysAutoAnswerBlank)
            optionsThatCanBeAutoAnswered.push(blankOption.id);
      }
    }

    if (!foundPassportValues) {
      // If we don't have any existing passport values for this fn but we do have a blank option,
      //  proceed through the blank if every option's val has been visited before or if "never put to user" is toggled on
      if (blankOption?.id)
        if (hasVisitedEveryOption || data?.alwaysAutoAnswerBlank)
          optionsThatCanBeAutoAnswered.push(blankOption.id);
    }

    // Even if we've never seen other options, if "never put to user" is toggled and a blank option exists, automate it by default
    if (
      optionsThatCanBeAutoAnswered.length === 0 &&
      blankOption?.id &&
      data?.alwaysAutoAnswerBlank
    )
      optionsThatCanBeAutoAnswered.push(blankOption.id);

    // Questions 'select one' and therefore can only auto-answer the single left-most matching option
    if (type === TYPES.Question) {
      optionsThatCanBeAutoAnswered = optionsThatCanBeAutoAnswered.slice(0, 1);
    }

    return optionsThatCanBeAutoAnswered.length > 0
      ? optionsThatCanBeAutoAnswered
      : undefined;
  },

  /**
   * Filters auto-answer based on a hierarchy of collected flags
   * @param filterId - id of the Filter node
   * @returns - id of the Answer node of the highest order matching flag
   */
  autoAnswerableFlag: (filterId: NodeId) => {
    const { breadcrumbs, flow } = get();

    const node = flow[filterId];
    if (!node) return;

    // Only Filter nodes that have an fn & edges are eligible for auto-answering
    const { type, data, edges } = node;
    if (!type || type !== TYPES.Filter || !data?.fn || !edges) return;

    // Get all options (aka flags or edges or Answer nodes) for this node
    const options: Array<Store.Node> = edges.map((edgeId) => ({
      id: edgeId,
      ...flow[edgeId],
    }));
    const optionsThatCanBeAutoAnswered: Array<NodeId> = [];

    // "New" Filters will have a category prop, but existing ones may still be relying on DEFAULT category
    const filterCategory = data?.category || DEFAULT_FLAG_CATEGORY;
    const collectedFlags = collectedFlagValuesByCategory(
      filterCategory,
      breadcrumbs,
      flow,
    );

    // Starting from the left of the Filter options, check for matches against collectedFlags
    options.forEach((option) => {
      collectedFlags.forEach((flag) => {
        if (option.data?.val === flag && option.id) {
          optionsThatCanBeAutoAnswered.push(option.id);
        }
      });
    });

    // If we didn't match a flag, travel through "No result" (aka blank) option
    if (optionsThatCanBeAutoAnswered.length === 0) {
      const noResultFlag = options.find((option) => !option.data?.val);
      if (noResultFlag?.id) optionsThatCanBeAutoAnswered.push(noResultFlag.id);
    }

    // Filters 'select one' and therefore can only auto-answer the single left-most matching flag option
    return optionsThatCanBeAutoAnswered.slice(0, 1).toString();
  },

  isFinalCard: () => {
    const { upcomingCardIds } = get();
    return upcomingCardIds().length === 1;
  },

  restore: false,

  changedNode: undefined,

  _nodesPendingEdit: [],

  path: ApplicationPath.SingleSession,

  saveToEmail: undefined,

  overrideAnswer: (fn: string) => {
    // Similar to 'changeAnswer', but enables navigating backwards to and overriding a previously **auto-answered** question which would typically be hidden
    const { breadcrumbs, flow, record, changeAnswer } = get();

    // Order of breadcrumb insertion is not guaranteed, sort upfront to match flow order so that later "find()" methods behave as expected
    const sortedBreadcrumbs = sortBreadcrumbs(breadcrumbs, flow);

    // The first nodeId that set the passport value (fn) being changed (eg FindProperty)
    const originalNodeId: Node["id"] | undefined = Object.entries(
      sortedBreadcrumbs,
    ).find(
      ([_nodeId, breadcrumb]) => breadcrumb.data && fn in breadcrumb.data,
    )?.[0];

    if (originalNodeId) {
      // Omit existing passport value from breadcrumbs.data in whichever node originally set it, so it won't be auto-answered in future
      //   and keep a receipt of the original value in breadcrumbs.data._overrides
      record(originalNodeId, {
        data: {
          ...omit(breadcrumbs?.[originalNodeId]?.data, fn),
          _overrides: { [fn]: breadcrumbs?.[originalNodeId]?.data?.[fn] },
        },
      });
    }

    // The first nodeId that is configured by an editor to manually set the passport value being changed (eg Question "What type of property is it?").
    //   This node has likely been auto-answered by the originalNodeId and we leave its' breadcrumbs.data intact so that the original answer is highlighted later
    const overrideNodeId: Node["id"] | undefined = Object.entries(
      sortedBreadcrumbs,
    ).find(
      ([nodeId, _breadcrumb]) =>
        flow[nodeId].data?.fn === fn || flow[nodeId].data?.val === fn,
    )?.[0];

    if (overrideNodeId) {
      // Travel backwards to the "override" nodeId to manually re-answer this question, therefore re-setting the passport value onSubmit
      changeAnswer(overrideNodeId);
    } else {
      throw new Error("overrideNodeId not found");
    }
  },

  requestedFiles: () => {
    // Importing PASSPORT_REQUESTED_FILES_KEY causes tests to fail - possible circular dependency issue?
    // Repeating it here so find and replace still points to this hardcoded value
    const PASSPORT_REQUESTED_FILES_KEY = "_requestedFiles";
    const { computePassport } = get();
    const currentRequestedFiles =
      computePassport().data?.[PASSPORT_REQUESTED_FILES_KEY];
    const emptyFileList = { required: [], recommended: [], optional: [] };

    return currentRequestedFiles || emptyFileList;
  },

  currentCard: null,

  getCurrentCard: () => get().currentCard,

  hasAcknowledgedWarning: false,
  setHasAcknowledgedWarning: () => set({ hasAcknowledgedWarning: true }),
});

interface RemoveOrphansFromBreadcrumbsProps {
  id: string;
  flow: Store.Flow;
  userData: Store.UserData;
  breadcrumbs: Store.CachedBreadcrumbs | Store.Breadcrumbs;
}

export const removeOrphansFromBreadcrumbs = ({
  id,
  flow,
  userData,
  breadcrumbs,
}: RemoveOrphansFromBreadcrumbsProps):
  | Store.CachedBreadcrumbs
  | Store.Breadcrumbs => {
  const result: Store.Breadcrumbs = { ...breadcrumbs };
  const userAnswers = new Set(userData?.answers ?? []);
  const edges = flow[id].edges ?? [];
  const orphanedEdges = edges.filter((edge) => !userAnswers.has(edge));

  // Use a stack to iteratively remove each orphan and all its descendants
  const toRemove = [...orphanedEdges];
  const visited = new Set<string>();

  while (toRemove.length > 0) {
    const currentId = toRemove.pop()!;
    if (visited.has(currentId)) continue;

    if (!flow[currentId]) {
      logger.notify(
        `Error removing orphans from breadcrumbs, nodeId "${id}" is missing from flow and likely corrupted`,
      );
      continue;
    }

    // Track node
    visited.add(currentId);

    // Remove orphaned node from new breadcrumbs
    if (result[currentId]) delete result[currentId];

    // Add all child edges to stack for processing
    const childEdges = flow[currentId].edges ?? [];
    for (const childId of childEdges) {
      if (!visited.has(childId)) {
        toRemove.push(childId);
      }
    }
  }

  return result;
};

export const sortBreadcrumbs = (
  nextBreadcrumbs: Store.Breadcrumbs,
  flow: Store.Flow,
  editingNodes?: string[],
) => {
  return editingNodes?.length
    ? nextBreadcrumbs
    : sortIdsDepthFirst(flow)(new Set(Object.keys(nextBreadcrumbs))).reduce(
        (acc, id) => ({ ...acc, [id]: nextBreadcrumbs[id] }),
        {} as Store.Breadcrumbs,
      );
};

function handleNodesWithPassport({
  flow,
  id,
  cachedBreadcrumbs,
  userData,
  currentNodesPendingEdit,
  breadcrumbs,
}: {
  flow: Store.Flow;
  id: string;
  cachedBreadcrumbs: Store.CachedBreadcrumbs;
  userData: Store.UserData;
  currentNodesPendingEdit: string[];
  breadcrumbs: Store.Breadcrumbs;
}) {
  let nodesPendingEdit = [...currentNodesPendingEdit];
  let newBreadcrumbs: Store.CachedBreadcrumbs = { ...cachedBreadcrumbs };

  const POPULATE_PASSPORT = [TYPES.FindProperty, TYPES.DrawBoundary];
  const breadcrumbPopulatesPassport =
    flow[id]?.type &&
    POPULATE_PASSPORT.includes(flow[id].type!) &&
    newBreadcrumbs?.[id] &&
    !isEqual(userData, newBreadcrumbs[id]);

  // Check if component populates passport so that nodes dependent on passport values
  // do not have inconsistent data on them after changing answer in Review.
  if (breadcrumbPopulatesPassport) {
    const { breadcrumbsWithoutPassportData, removedNodeIds } =
      removeNodesDependentOnPassport(flow, newBreadcrumbs);

    newBreadcrumbs = breadcrumbsWithoutPassportData;
    if (removedNodeIds.length) {
      nodesPendingEdit = removedNodeIds;
    }
  }

  if (
    nodesPendingEdit.every(
      (pendingId) =>
        Object.keys(breadcrumbs).includes(pendingId) || pendingId === id,
    )
  ) {
    nodesPendingEdit = [];
  }

  return { newBreadcrumbs, nodesPendingEdit };
}

// We need to remove some components that rely on passport values from the cached breadcrumbs
// when changing answers from review component to guarantee that their values are updated.
// XXX: This logic assumes only one "FindProperty" component per flow.
export const removeNodesDependentOnPassport = (
  flow: Store.Flow,
  breadcrumbs: Store.Breadcrumbs,
): {
  breadcrumbsWithoutPassportData: Store.Breadcrumbs;
  removedNodeIds: string[];
} => {
  const DEPENDENT_TYPES = [
    TYPES.DrawBoundary,
    TYPES.MapAndLabel,
    TYPES.PlanningConstraints,
    TYPES.PropertyInformation,
  ];
  const newBreadcrumbs = { ...breadcrumbs };
  const removedNodeIds = Object.entries(flow).reduce((acc, [id, value]) => {
    if (
      value?.type &&
      DEPENDENT_TYPES.includes(value.type) &&
      newBreadcrumbs[id]
    ) {
      delete newBreadcrumbs[id];
      return [...acc, id];
    }
    return acc;
  }, [] as string[]);
  return { removedNodeIds, breadcrumbsWithoutPassportData: newBreadcrumbs };
};

const collectedFlagValuesByCategory = (
  category: Parameters<PreviewStore["resultData"]>[0] = DEFAULT_FLAG_CATEGORY,
  breadcrumbs: Store.Breadcrumbs,
  flow: Store.Flow,
): Array<Flag["value"]> => {
  // Get all possible flag values for this flagset category
  const possibleFlags = flatFlags.filter((flag) => flag.category === category);
  const possibleFlagValues = possibleFlags.map((flag) => flag.value);

  // Get all flags collected so far based on selected answers, excluding flags not in this category
  const collectedFlags: Array<Flag["value"]> = [];
  Object.entries(breadcrumbs).forEach(([_nodeId, breadcrumb]) => {
    if (breadcrumb.answers) {
      breadcrumb.answers.forEach((answerId) => {
        const node = flow[answerId];
        if (node?.data?.flags) {
          node.data.flags.forEach((flag: Flag["value"]) => {
            if (possibleFlagValues.includes(flag)) collectedFlags.push(flag);
          });
        }
      });
    }
  });

  // Return de-duplicated collected flags in hierarchical order
  return [
    ...new Set(
      collectedFlags.sort(
        (a, b) => possibleFlagValues.indexOf(a) - possibleFlagValues.indexOf(b),
      ),
    ),
  ];
};
