import type {
  Flag,
  FlagSet,
  GovUKPayment,
  Node,
} from "@opensystemslab/planx-core/types";
import {
  DEFAULT_FLAG_CATEGORY,
  flatFlags,
} from "@opensystemslab/planx-core/types";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import {
  FileList,
  PASSPORT_REQUESTED_FILES_KEY,
} from "@planx/components/FileUploadAndLabel/model";
import { sortIdsDepthFirst } from "@planx/graph";
import { logger } from "airbrake";
import { objectWithoutNullishValues } from "lib/objectHelpers";
import difference from "lodash/difference";
import flatten from "lodash/flatten";
import isEqual from "lodash/isEqual";
import isNil from "lodash/isNil";
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
let memoizedBreadcrumb: Store.breadcrumbs | undefined = undefined;
export interface PreviewStore extends Store.Store {
  collectedFlags: (
    upToNodeId: Store.nodeId,
    visited?: Array<string>,
  ) => Array<string>;
  currentCard: () => Store.node | null;
  hasPaid: () => boolean;
  previousCard: (
    node: Store.node | null,
    upcomingCardIds?: Store.nodeId[],
  ) => Store.nodeId | undefined;
  canGoBack: (node: Store.node | null) => boolean;
  getType: (node: Store.node | null) => TYPES | undefined;
  computePassport: () => Readonly<Store.passport>;
  record: (id: Store.nodeId, userData?: Store.userData) => void;
  resultData: (
    flagSet?: string,
    overrides?: {
      [flagId: string]: { heading?: string; description?: string };
    },
  ) => {
    [category: string]: {
      flag: Flag;
      responses: any[];
      displayText: { heading: string; description: string };
    };
  };
  resumeSession: (session: Session) => void;
  sessionId: string;
  upcomingCardIds: () => Store.nodeId[];
  isFinalCard: () => boolean;
  govUkPayment?: GovUKPayment;
  setGovUkPayment: (govUkPayment: GovUKPayment) => void;
  cachedBreadcrumbs?: Store.cachedBreadcrumbs;
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

  currentCard() {
    const { upcomingCardIds, flow } = get();
    const upcoming = upcomingCardIds();

    if (upcoming.length > 0) {
      const id = upcoming[0];
      return {
        id,
        ...flow[id],
      };
    } else {
      return null;
    }
  },

  hasPaid: () => {
    const { breadcrumbs, flow } = get();

    return Object.entries(breadcrumbs).some(
      ([id, userData]) => flow[id]?.type === TYPES.Pay && !userData.auto,
    );
  },

  previousCard: (node: Store.node | null) => {
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

  canGoBack: (node: Store.node | null) => {
    // XXX: node is a required param until upcomingNodes().shift() is
    //      optimised/memoized, see related isFinalCard() comment below
    const { hasPaid, previousCard } = get();
    return Boolean(node?.id) && Boolean(previousCard(node)) && !hasPaid();
  },

  getType: (node: Store.node | null) => {
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

        const passportData: Store.passport["data"] = {};

        if (key) {
          const passportValue = answers
            .map((id: string) => flow[id]?.data?.val)
            .filter(
              (val) =>
                val !== undefined && val !== null && String(val).trim() !== "",
            );

          if (passportValue.length > 0) {
            const existingValue = acc.data?.[key] ?? [];

            const combined = existingValue
              .concat(passportValue)
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
          {} as Store.passport["data"],
        );

        return {
          ...acc,
          data: {
            ...acc.data,
            ...responseData,
            ...passportData,
          },
        };
      },
      {
        data: {},
      } as Store.passport,
    );

    return passport;
  },

  // record() notably handles removing cachedBreadcrumbs for dependent component types
  //   ie if you 'go back' to change your address, DrawBoundary and PlanningConstraints shouldn't be retained because they reference the property site passport, but answers to other questions can be retained
  record(id, userData) {
    const {
      breadcrumbs,
      flow,
      restore,
      cachedBreadcrumbs,
      _nodesPendingEdit,
      changedNode,
      updateSectionData,
    } = get();

    if (!flow[id]) throw new Error("id not found");

    if (userData) {
      // add breadcrumb
      const { answers = [], data = {}, auto = false, override } = userData;

      const breadcrumb: Store.userData = { auto: Boolean(auto) };
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
    updateSectionData();
  },

  resultData(flagSet, overrides) {
    const { breadcrumbs, flow } = get();
    return getResultData(breadcrumbs, flow, flagSet, overrides);
  },

  resumeSession(session: Session) {
    set({ ...session });
    get().updateSectionData();
  },

  sessionId: uuidV4(),

  upcomingCardIds() {
    const { flow, breadcrumbs, computePassport, collectedFlags } = get();

    const knownNotVals = knownNots(
      flow,
      breadcrumbs,
      // _nots is created by PlanningConstraints/Public
      computePassport().data?._nots,
    );

    const ids: Set<Store.nodeId> = new Set();
    const visited: Set<Store.nodeId> = new Set();

    const nodeIdsConnectedFrom = (source: Store.nodeId): void => {
      return (flow[source]?.edges ?? [])
        .filter((id) => {
          if (visited.has(id)) return false;

          visited.add(id);

          const node = flow[id];

          return (
            node &&
            !breadcrumbs[id] &&
            ((node.edges || []).length > 0 ||
              (node.type && !SUPPORTED_DECISION_TYPES.includes(node.type)))
          );
        })
        .forEach((id) => {
          const node = flow[id];

          const passport = computePassport();

          if (node.type === TYPES.InternalPortal) {
            return nodeIdsConnectedFrom(id);
          }

          const fn = node.type === TYPES.Filter ? "flag" : node.data?.fn;

          const [globalFlag] = collectedFlags(id, Array.from(visited));

          let passportValues = (() => {
            try {
              return fn === "flag" ? globalFlag : passport.data?.[fn]?.sort();
            } catch (err) {
              return [];
            }
          })();

          if (fn && (fn === "flag" || passportValues !== undefined)) {
            const responses = node.edges?.map((id) => ({
              id,
              ...flow[id],
            }));

            let responsesThatCanBeAutoAnswered = [] as any[];

            const sortedResponses = responses
              ? responses
                  // sort by the most to least number of comma-separated items in data.val
                  .sort(
                    (a: any, b: any) =>
                      String(b.data?.val).split(",").length -
                      String(a.data?.val).split(",").length,
                  )
                  .filter((response) => response.data?.val)
              : [];

            if (passportValues !== undefined) {
              if (!Array.isArray(passportValues))
                passportValues = [passportValues];

              passportValues = (passportValues || []).filter((pv: any) =>
                sortedResponses.some((r) => pv.startsWith(r.data.val)),
              );

              if (passportValues.length > 0) {
                responsesThatCanBeAutoAnswered = (sortedResponses || []).filter(
                  (r) => {
                    const responseValues = String(r.data.val).split(",").sort();
                    return String(responseValues) === String(passportValues);
                  },
                );

                if (responsesThatCanBeAutoAnswered.length === 0) {
                  responsesThatCanBeAutoAnswered = (
                    sortedResponses || []
                  ).filter((r) => {
                    const responseValues = String(r.data.val).split(",").sort();

                    for (const responseValue of responseValues) {
                      return passportValues.some((passportValue: any) =>
                        String(passportValue).startsWith(responseValue),
                      );
                    }
                  });
                }
              }
            }

            if (responsesThatCanBeAutoAnswered.length === 0) {
              const _responses = (responses || []).filter(
                (r) => !knownNotVals[fn]?.includes(r.data?.val),
              );

              if (_responses.length === 1 && isNil(_responses[0].data?.val)) {
                responsesThatCanBeAutoAnswered = _responses;
              } else if (
                !passport.data?.[fn] ||
                passport.data?.[fn].length > 0
              ) {
                responsesThatCanBeAutoAnswered = (responses || []).filter(
                  (r) => !r.data?.val,
                );
              }
            }

            if (responsesThatCanBeAutoAnswered.length > 0) {
              if (node.type !== TYPES.Checklist) {
                responsesThatCanBeAutoAnswered =
                  responsesThatCanBeAutoAnswered.slice(0, 1);
              }

              if (fn !== "flag") {
                set({
                  breadcrumbs: {
                    ...breadcrumbs,
                    [id]: {
                      answers: responsesThatCanBeAutoAnswered.map((r) => r.id),
                      auto: true,
                    },
                  },
                });
              }

              return responsesThatCanBeAutoAnswered.forEach((r) =>
                nodeIdsConnectedFrom(r.id),
              );
            }
          } else if (
            fn &&
            knownNotVals[fn] &&
            passportValues === undefined &&
            Array.isArray(node.edges)
          ) {
            const data = node.edges.reduce(
              (acc, edgeId) => {
                if (flow[edgeId].data?.val === undefined) {
                  acc.responseWithNoValueId = edgeId;
                } else if (!knownNotVals[fn].includes(flow[edgeId].data?.val)) {
                  acc.edges.push(edgeId);
                }
                return acc;
              },
              { edges: [] } as {
                responseWithNoValueId?: Store.nodeId;
                edges: Array<Store.nodeId>;
              },
            );

            if (data.responseWithNoValueId && data.edges.length === 0) {
              set({
                breadcrumbs: {
                  ...breadcrumbs,
                  [id]: {
                    answers: [data.responseWithNoValueId],
                    auto: true,
                  },
                },
              });
              return nodeIdsConnectedFrom(data.responseWithNoValueId);
            }
          }

          ids.add(id);
        });
    };

    // with a guaranteed unique set
    new Set(
      // of all the answers collected so far
      Object.values(breadcrumbs)
        // in reverse order
        .flatMap(({ answers }) => answers as Array<Store.nodeId>)
        // .filter(Boolean)
        .reverse()
        // ending with _root
        .concat("_root"),
      // run nodeIdsConnectedFrom(answerId)
    ).forEach(nodeIdsConnectedFrom);

    // then return an array of the upcoming node ids, in depth-first order
    return sortIdsDepthFirst(flow)(ids);
  },

  isFinalCard: () => {
    // Temporarily always returns false until upcomingCardIds is optimised
    // OSL Slack explanation: https://bit.ly/3x38IRY
    return false;

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
      //   and keep a receipt of the original value in breadcrumbs.override
      record(originalNodeId, {
        data: omit(breadcrumbs?.[originalNodeId]?.data, fn),
        override: {
          [fn]: breadcrumbs?.[originalNodeId]?.data?.[fn],
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
});

const knownNots = (
  flow: Store.flow,
  breadcrumbs: Store.breadcrumbs,
  nots = {},
) =>
  Object.entries(breadcrumbs).reduce(
    (acc, [id, { answers = [] }]) => {
      if (!flow[id]) return acc;

      const _knownNotVals = difference(
        flow[id].edges,
        answers as Array<Store.nodeId>,
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
  flow: Store.flow;
  userData: Store.userData;
  breadcrumbs: Store.cachedBreadcrumbs | Store.breadcrumbs;
}

export const removeOrphansFromBreadcrumbs = ({
  id,
  flow,
  userData,
  breadcrumbs,
}: RemoveOrphansFromBreadcrumbsProps):
  | Store.cachedBreadcrumbs
  | Store.breadcrumbs => {
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
    { ...breadcrumbs } as Store.cachedBreadcrumbs | Store.breadcrumbs,
  );
};

export const getResultData = (
  breadcrumbs: Store.breadcrumbs,
  flow: Store.flow,
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
    {} as ReturnType<PreviewStore["resultData"]>,
  );
};

export const sortBreadcrumbs = (
  nextBreadcrumbs: Store.breadcrumbs,
  flow: Store.flow,
  editingNodes?: string[],
) => {
  return editingNodes?.length
    ? nextBreadcrumbs
    : sortIdsDepthFirst(flow)(new Set(Object.keys(nextBreadcrumbs))).reduce(
        (acc, id) => ({ ...acc, [id]: nextBreadcrumbs[id] }),
        {} as Store.breadcrumbs,
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
  flow: Store.flow;
  id: string;
  cachedBreadcrumbs: Store.cachedBreadcrumbs;
  userData: Store.userData;
  currentNodesPendingEdit: string[];
  breadcrumbs: Store.breadcrumbs;
}) {
  let nodesPendingEdit = [...currentNodesPendingEdit];
  let newBreadcrumbs: Store.cachedBreadcrumbs = { ...cachedBreadcrumbs };

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
  flow: Store.flow,
  breadcrumbs: Store.breadcrumbs,
): {
  breadcrumbsWithoutPassportData: Store.breadcrumbs;
  removedNodeIds: string[];
} => {
  const DEPENDENT_TYPES = [
    TYPES.PlanningConstraints,
    TYPES.DrawBoundary,
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
