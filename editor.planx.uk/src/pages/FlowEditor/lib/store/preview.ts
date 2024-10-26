import type {
  Flag,
  FlagSet,
  GovUKPayment,
  Node,
  NodeId,
  Value,
} from "@opensystemslab/planx-core/types";
import {
  ComponentType as TYPES,
  DEFAULT_FLAG_CATEGORY,
  flatFlags,
} from "@opensystemslab/planx-core/types";
import { FileList } from "@planx/components/FileUploadAndLabel/model";
import { SetValue } from "@planx/components/SetValue/model";
import { handleSetValue } from "@planx/components/SetValue/utils";
import { sortIdsDepthFirst } from "@planx/graph";
import { logger } from "airbrake";
import { objectWithoutNullishValues } from "lib/objectHelpers";
import difference from "lodash/difference";
import flatten from "lodash/flatten";
import isEqual from "lodash/isEqual";
import omit from "lodash/omit";
import pick from "lodash/pick";
import uniq from "lodash/uniq";
import { v4 as uuidV4 } from "uuid";
import type { StateCreator } from "zustand";

import type { Session } from "./../../../../types";
import { ApplicationPath } from "./../../../../types";
import type { Store } from ".";
import { NavigationStore } from "./navigation";
import type { SharedStore } from "./shared";

const SUPPORTED_DECISION_TYPES = [TYPES.Checklist, TYPES.Question];
let memoizedPreviousCardId: string | undefined = undefined;
let memoizedBreadcrumb: Store.Breadcrumbs | undefined = undefined;

export interface Response {
  question: Node & { id: NodeId };
  selections: Array<Node & { id: NodeId }>;
  hidden: boolean;
}

export interface PreviewStore extends Store.Store {
  collectedFlags: (
    upToNodeId: NodeId,
    visited?: Array<string>,
  ) => Array<string>;
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
  ) => {
    [category: string]: {
      flag: Flag;
      responses: Array<Response>;
      displayText: { heading: string; description: string };
    };
  };
  resumeSession: (session: Session) => void;
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
  autoAnswerableOptions: (id: NodeId) => Array<NodeId> | undefined;
  autoAnswerableFlag: (filterId: NodeId) => NodeId | undefined;
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

  collectedFlags(upToNodeId, visited = []) {
    const { breadcrumbs, flow } = get();

    const possibleFlags = flatFlags.filter(
      (f) => f.category === DEFAULT_FLAG_CATEGORY,
    );
    const flagKeys: string[] = possibleFlags
      .map((flag) => flag.value)
      .filter((value): value is string => Boolean(value));

    const breadcrumbIds = Object.keys(breadcrumbs);

    const idx = breadcrumbIds.indexOf(upToNodeId);

    let ids: Array<string> = [];

    if (idx >= 0) {
      ids = breadcrumbIds.slice(0, idx + 1);
    } else if (visited.length > 1 && visited.includes(upToNodeId)) {
      ids = breadcrumbIds.filter((id) => visited.includes(id));
    }

    const res = ids
      .reduce((acc, k) => {
        breadcrumbs[k].answers?.forEach((id: string) => {
          acc.push(flow[id]?.data?.flag);
        });
        return acc;
      }, [] as Array<string>)
      .filter((flag) => flag && flagKeys.includes(flag))
      .sort((a, b) => flagKeys.indexOf(a) - flagKeys.indexOf(b));

    return res;
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

            const combined = passportValue
              .concat(existingValue)
              .reduce(
                (acc: string[], curr: string, _i: number, arr: string[]) => {
                  if (!arr.some((x) => x !== curr && x.startsWith(curr))) {
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

      const breadcrumb: Store.UserData = { auto: Boolean(auto) };
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
        cachedBreadcrumbs: { ...(restore ? {} : cacheWithoutOrphans) }, // clean cache if restore is true (i.e. if user has changed his answer)
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
    return getResultData(breadcrumbs, flow, flagSet, overrides);
  },

  resumeSession(session: Session) {
    set({ ...session });
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

  /**
   * Questions and Checklists auto-answer based on passport values
   * @param id - id of the Question or Checklist node
   * @returns - list of ids of the Answer nodes which can auto-answered (max length 1 for Questions) 
   */
  autoAnswerableOptions: (id: NodeId) => {
    const { breadcrumbs, flow, computePassport } = get();
    const { type, data, edges } = flow[id];

    // Only Queston & Checklist nodes that have an fn & edges are eligible for auto-answering
    if (!type || ![TYPES.Question, TYPES.Checklist].includes(type) || !data?.fn || !edges) return;

    // Only proceed if the user has seen at least one node with this fn before
    const visitedFns = Object.entries(breadcrumbs).filter(([nodeId, _breadcrumb]) => flow[nodeId].data?.fn === data.fn);
    if (!visitedFns) return;

    // Get all options (aka edges or Answer nodes) for this node
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
    const blankOption = options.find((option) => !option.data?.val);
    let optionsThatCanBeAutoAnswered: Array<NodeId> = [];

    // Get existing passport value(s) for this node's fn
    let passportValues = computePassport()?.data?.[data.fn]?.sort();
    if (!Array.isArray(passportValues)) passportValues = [passportValues].filter(Boolean);

    // If we have an existing passport value for this fn, 
    //   then proceed through the matching option(s) or the blank option independent if other vals have been seen before
    if (passportValues.length > 0) {
      // Check if the existing passport value(s) startsWith at least one option's val (eg passport retains most granular values only)
      const matchingPassportValues = passportValues.filter((passportValue: any) =>
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
            } else if (passportValue.startsWith(option.data?.val) && !foundExactMatch) {
              if (option.id) optionsThatCanBeAutoAnswered.push(option.id);
            }
          });
        });
      } else {
        if (blankOption?.id) optionsThatCanBeAutoAnswered.push(blankOption.id);
      }
    } else {
      // If we don't have any existing passport values for this fn but we do have a blank option,
      //  proceed through the blank if every option's val has been visited before
      const sortedOptionVals: string[] = sortedOptions.map((option) => option.data?.val);
      let visitedOptionVals: string[] = [];
      visitedFns.forEach(([nodeId, _breadcrumb]) => {
        flow[nodeId].edges?.map((edgeId) => {
          if (flow[edgeId].type === TYPES.Answer && flow[edgeId].data?.val) {
            visitedOptionVals.push(flow[edgeId].data.val);
          }
        })
      });

      // Planning Constraints use a bespoke "_nots" data structure to describe all option vals returned via GIS API
      //   Concat these onto other visitedOptionVals so that questions about constraints we haven't fetched are put to user exactly once
      if (visitedFns.some(([nodeId, _breadcrumb]) => flow[nodeId].type === TYPES.PlanningConstraints)) {
        const nots: string[] | undefined = computePassport()?.data?.["_nots"]?.[data.fn];
        if (nots) visitedOptionVals = visitedOptionVals.concat(nots);
      }

      const hasVisitedEveryOption = sortedOptionVals.every(value => visitedOptionVals.includes(value));
      if (blankOption?.id && hasVisitedEveryOption) optionsThatCanBeAutoAnswered.push(blankOption.id);
    }

    // Questions 'select one' and therefore can only auto-answer the single left-most matching option
    if (type === TYPES.Question) {
      optionsThatCanBeAutoAnswered = optionsThatCanBeAutoAnswered.slice(0, 1);
    }

    return optionsThatCanBeAutoAnswered;
  },

  /**
   * Filters auto-answer based on a heirarchy of collected flags
   * @param filterId - id of the Filter node
   * @returns - id of the Answer node of the highest order matching flag
   */
  autoAnswerableFlag: (filterId: NodeId) => {
    const { breadcrumbs, flow } = get();
    const { type, data, edges } = flow[filterId];

    // Only Filter nodes that have an fn & edges are eligible for auto-answering
    if (!type || type !== TYPES.Filter || !data?.fn || !edges) return;

    // Get all options (aka flags or edges or Answer nodes) for this node
    const options: Array<Store.Node> = edges.map((edgeId) => ({
      id: edgeId,
      ...flow[edgeId],
    }));
    let optionsThatCanBeAutoAnswered: Array<NodeId> = [];

    // "New" Filters will have a category prop, but existing ones may still be relying on DEFAULT category
    const filterCategory = data?.category || DEFAULT_FLAG_CATEGORY;
    const possibleFlags = flatFlags.filter(
      (flag) => flag.category === filterCategory,
    );
    const possibleFlagValues = possibleFlags.map((flag) => flag.value);

    // Get all flags collected so far based on selected answers, excluding flags not in this category
    const collectedFlags: Flag[] = [];
    Object.entries(breadcrumbs).forEach(([_nodeId, breadcrumb]) => {
      if (breadcrumb.answers) {
        breadcrumb.answers.forEach((answerId) => {
          const node = flow[answerId];
          if (node.data?.flag && possibleFlagValues.includes(node.data.flag))
            collectedFlags.push(node.data?.flag);
        });
      }
    });

    // Starting from the left of the Filter options, check for matches
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
    // Temporarily always returns false until upcomingCardIds is optimised
    // OSL Slack explanation: https://bit.ly/3x38IRY
    return false;
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
});

const knownNots = (
  flow: Store.Flow,
  breadcrumbs: Store.Breadcrumbs,
  nots = {},
) =>
  Object.entries(breadcrumbs).reduce(
    (acc, [id, { answers = [] }]) => {
      if (!flow[id]) return acc;

      const _knownNotVals = difference(
        flow[id].edges,
        answers as Array<NodeId>,
      );

      if (flow[id].data?.fn) {
        acc[flow[id].data.fn] = uniq(
          flatten([
            ...(acc[flow[id].data?.fn] || []),
            _knownNotVals.flatMap((n) => flow[n].data?.val),
          ]),
        ).filter(Boolean) as Array<string>;
      }

      return acc;
    },
    {
      ...nots,
    } as Record<string, Array<string>>,
  );

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
  // this will prevent a user from "Continuing", therefore log error don't throw it
  if (!flow[id]) {
    logger.notify(
      `Error removing orphans from breadcrumbs, nodeId "${id}" is missing from flow and likely corrupted`,
    );
  }

  const idsToRemove =
    flow[id]?.edges?.filter(
      (edge) => !(userData?.answers ?? []).includes(edge),
    ) ?? [];

  return idsToRemove.reduce(
    (acc, id) => {
      delete acc?.[id];
      // recursion to remove orphans from tree
      return removeOrphansFromBreadcrumbs({
        id,
        flow,
        userData: flow[id],
        breadcrumbs: acc,
      });
    },
    { ...breadcrumbs } as Store.CachedBreadcrumbs | Store.Breadcrumbs,
  );
};

export const getResultData = (
  breadcrumbs: Store.Breadcrumbs,
  flow: Store.Flow,
  flagSet: Parameters<PreviewStore["resultData"]>[0] = DEFAULT_FLAG_CATEGORY,
  overrides?: Parameters<PreviewStore["resultData"]>[1],
) => {
  const categories = [flagSet];

  return categories.reduce(
    (
      acc: {
        [category: string]: {
          flag: Flag;
          responses: any[];
          displayText: { heading: string; description: string };
        };
      },
      category: string,
    ) => {
      // might DRY this up with preceding collectedFlags function
      const possibleFlags: Flag[] = flatFlags.filter(
        (f) => f.category === category,
      );
      const keys = possibleFlags.map((f) => f.value);
      const collectedFlags = Object.values(breadcrumbs).flatMap(
        ({ answers = [] }) => answers.map((id) => flow[id]?.data?.flag),
      );

      const filteredCollectedFlags = collectedFlags
        .filter((flag) => flag && keys.includes(flag))
        .sort((a, b) => keys.indexOf(a) - keys.indexOf(b));

      const flag: Flag = possibleFlags.find(
        (f) => f.value === filteredCollectedFlags[0],
      ) || {
        // value: "PP-NO_RESULT",
        value: undefined,
        text: "No result",
        category: category as FlagSet,
        bgColor: "#EEEEEE",
        color: "#000000",
        description: "",
      };

      const responses = Object.entries(breadcrumbs)
        .map(([k, { answers = [] }]) => {
          const question = { id: k, ...flow[k] };

          const questionType = question?.type;

          if (!questionType || !SUPPORTED_DECISION_TYPES.includes(questionType))
            return null;

          const selections = answers.map((id) => ({ id, ...flow[id] }));
          const hidden = !selections.some(
            (r) => r.data?.flag && r.data.flag === flag?.value,
          );

          return {
            question,
            selections,
            hidden,
          };
        })
        .filter(Boolean);

      const heading =
        (flag.value && overrides && overrides[flag.value]?.heading) ||
        flag.text;
      const description =
        (flag.value && overrides && overrides[flag.value]?.description) ||
        flagSet;

      acc[category] = {
        flag,
        displayText: { heading, description },
        responses: responses.every((r: any) => r.hidden)
          ? responses.map((r: any) => ({ ...r, hidden: false }))
          : responses,
      };

      return acc;
    },
    {},
  );
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
