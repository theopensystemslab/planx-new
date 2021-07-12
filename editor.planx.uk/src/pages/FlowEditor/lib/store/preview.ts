import { gql } from "@apollo/client";
import tinycolor from "@ctrl/tinycolor";
import { TYPES } from "@planx/components/types";
import { sortIdsDepthFirst } from "@planx/graph";
import { client } from "lib/graphql";
import { objectWithoutNullishValues } from "lib/objectHelpers";
import difference from "lodash/difference";
import flatten from "lodash/flatten";
import isNil from "lodash/isNil";
import pick from "lodash/pick";
import uniq from "lodash/uniq";
import type { Flag, GovUKPayment } from "types";
import { v4 } from "uuid";
import type { GetState, SetState } from "zustand/vanilla";
import type { Store } from ".";
import { DEFAULT_FLAG_CATEGORY, flatFlags } from "../../data/flags";
import type { SharedStore } from "./shared";

const SUPPORTED_DECISION_TYPES = [TYPES.Checklist, TYPES.Statement];

export interface PreviewStore extends Store.Store {
  collectedFlags: (
    upToNodeId: Store.nodeId,
    visited?: Array<string>
  ) => Array<string>;
  currentCard: () => Store.node | null;
  hasPaid: () => boolean;
  previousCard: () => Store.nodeId | undefined;
  canGoBack: (nodeId: Store.nodeId) => boolean;
  computePassport: () => Readonly<Store.passport>;
  record: (id: Store.nodeId, userData?: Store.userData) => void;
  resultData: (
    flagSet?: string,
    overrides?: { [flagId: string]: { heading?: string; description?: string } }
  ) => {
    [category: string]: {
      flag: Flag;
      responses: any[];
      displayText: { heading: string; description: string };
    };
  };
  resumeSession: (session: {
    passport: Store.passport;
    breadcrumbs: Store.breadcrumbs;
    sessionId: string;
    id: SharedStore["id"];
  }) => void;
  sessionId: string;
  sendSessionDataToHasura: () => void;
  upcomingCardIds: () => Store.nodeId[];
  isFinalCard: () => boolean;
  // temporary measure for storing payment fee & id between gov uk redirect
  govUkPayment?: GovUKPayment;
  setGovUkPayment: (govUkPayment: GovUKPayment) => void;
}

export const previewStore = (
  set: SetState<PreviewStore>,
  get: GetState<SharedStore & PreviewStore>
): PreviewStore => ({
  setGovUkPayment(govUkPayment) {
    set({ govUkPayment });
  },

  collectedFlags(upToNodeId, visited = []) {
    const { breadcrumbs, flow } = get();

    const possibleFlags = flatFlags.filter(
      (f) => f.category === DEFAULT_FLAG_CATEGORY
    );
    const flagKeys = possibleFlags.map((f) => f.value);

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
      ([id, userData]) => flow[id]?.type === TYPES.Pay && !userData.auto
    );
  },

  previousCard: () => {
    const goBackable = Object.entries(get().breadcrumbs)
      .filter(([, v]) => !v.auto)
      .map(([k]) => k);

    return goBackable.pop();
  },

  canGoBack: (nodeId) => {
    // XXX: nodeId is a required param until upcomingNodes().shift() is
    //      optimised/memoized, see related isFinalCard() comment below
    const { flow, hasPaid, previousCard } = get();
    return (
      flow[nodeId]?.type !== TYPES.Confirmation &&
      Boolean(previousCard()) &&
      !hasPaid()
    );
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
                val !== undefined && val !== null && String(val).trim() !== ""
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
                []
              );

            passportData[key] = uniq(combined);
          }
        }

        const responseData = Object.entries(data).reduce(
          (_acc, [id, value]) => {
            _acc![id] = value;
            return _acc;
          },
          {} as Store.passport["data"]
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
      } as Store.passport
    );

    return passport;
  },

  record(id, userData) {
    const { breadcrumbs, flow } = get();

    if (!flow[id]) throw new Error("id not found");

    if (userData) {
      // add breadcrumb
      const { answers = [], data = {}, auto = false } = userData;

      const breadcrumb: Store.userData = { auto: Boolean(auto) };
      if (answers?.length > 0) breadcrumb.answers = answers;

      const filteredData = objectWithoutNullishValues(data);

      if (Object.keys(filteredData).length > 0) breadcrumb.data = filteredData;

      set({
        breadcrumbs: {
          ...breadcrumbs,
          [id]: breadcrumb,
        },
      });
    } else {
      // remove breadcrumbs that were stored from id onwards

      const breadcrumbIds = Object.keys(breadcrumbs);
      const idx = breadcrumbIds.indexOf(id);

      if (idx >= 0) {
        set({
          breadcrumbs: pick(breadcrumbs, breadcrumbIds.slice(0, idx)),
        });
      }
    }
  },

  resultData(flagSet, overrides) {
    const { breadcrumbs, flow } = get();
    return getResultData(breadcrumbs, flow, flagSet, overrides);
  },

  resumeSession(args) {
    set(args);
  },

  sessionId: v4(),

  async sendSessionDataToHasura() {
    try {
      const { breadcrumbs, computePassport, flow, id, sessionId } = get();

      await client.mutate({
        mutation: gql`
          mutation CreateSession(
            $flow_data: jsonb
            $flow_id: uuid
            $flow_version: Int = 0
            $passport: jsonb
          ) {
            insert_sessions_one(
              object: {
                flow_data: $flow_data
                flow_id: $flow_id
                passport: $passport
                flow_version: $flow_version
              }
            ) {
              id
            }
          }
        `,
        // XXX: session.id is auto-generated by postgres and is temporarily
        //      behaving like a regular sequential ID that can be ignored.
        //
        //      store.sessionId is now stored inside the 'passport' field,
        //      as that's now a data blob containing the user's state.
        //
        //      This is a temporary measure because if we send get().sessionId
        //      to sessions.id, there would be conflicts if it was sent more
        //      than once, and potentially important data would be lost.
        variables: {
          flow_data: flow,
          flow_id: id,
          passport: {
            sessionId,
            breadcrumbs,
            passport: computePassport(),
          },
        },
      });
    } catch (e) {}
  },

  upcomingCardIds() {
    const { flow, breadcrumbs, computePassport, collectedFlags } = get();

    const knownNotVals = knownNots(
      flow,
      breadcrumbs,
      // _nots is created by FindProperty/Public atm
      computePassport().data?._nots
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

          if (
            node.type &&
            [TYPES.InternalPortal, TYPES.Page].includes(node.type)
          ) {
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
                      String(a.data?.val).split(",").length
                  )
                  .filter((response) => response.data?.val)
              : [];

            if (passportValues !== undefined) {
              if (!Array.isArray(passportValues))
                passportValues = [passportValues];

              passportValues = (passportValues || []).filter((pv: any) =>
                sortedResponses.some((r) => pv.startsWith(r.data.val))
              );

              if (passportValues.length > 0) {
                responsesThatCanBeAutoAnswered = (sortedResponses || []).filter(
                  (r) => {
                    const responseValues = String(r.data.val).split(",").sort();
                    return String(responseValues) === String(passportValues);
                  }
                );

                if (responsesThatCanBeAutoAnswered.length === 0) {
                  responsesThatCanBeAutoAnswered = (
                    sortedResponses || []
                  ).filter((r) => {
                    const responseValues = String(r.data.val).split(",").sort();

                    for (const responseValue of responseValues) {
                      return passportValues.some((passportValue: any) =>
                        String(passportValue).startsWith(responseValue)
                      );
                    }
                  });
                }
              }
            }

            if (responsesThatCanBeAutoAnswered.length === 0) {
              const _responses = (responses || []).filter(
                (r) => !knownNotVals[fn]?.includes(r.data?.val)
              );

              if (_responses.length === 1 && isNil(_responses[0].data?.val)) {
                responsesThatCanBeAutoAnswered = _responses;
              } else if (
                !passport.data?.[fn] ||
                passport.data?.[fn].length > 0
              ) {
                responsesThatCanBeAutoAnswered = (responses || []).filter(
                  (r) => !r.data?.val
                );
              }
            }

            if (responsesThatCanBeAutoAnswered.length > 0) {
              if (node.type !== TYPES.Checklist) {
                responsesThatCanBeAutoAnswered = responsesThatCanBeAutoAnswered.slice(
                  0,
                  1
                );
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
                nodeIdsConnectedFrom(r.id)
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
              }
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
        .concat("_root")
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
});

const knownNots = (
  flow: Store.flow,
  breadcrumbs: Store.breadcrumbs,
  nots = {}
) =>
  Object.entries(breadcrumbs).reduce(
    (acc, [id, { answers = [] }]) => {
      if (!flow[id]) return acc;

      const _knownNotVals = difference(
        flow[id].edges,
        answers as Array<Store.nodeId>
      );

      if (flow[id].data?.fn) {
        acc[flow[id].data.fn] = uniq(
          flatten([
            ...(acc[flow[id].data?.fn] || []),
            _knownNotVals.flatMap((n) => flow[n].data?.val),
          ])
        ).filter(Boolean) as Array<string>;
      }

      return acc;
    },
    {
      ...nots,
    } as Record<string, Array<string>>
  );

export const getResultData = (
  breadcrumbs: Store.breadcrumbs,
  flow: Store.flow,
  flagSet: Parameters<PreviewStore["resultData"]>[0] = DEFAULT_FLAG_CATEGORY,
  overrides?: Parameters<PreviewStore["resultData"]>[1]
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
      category: string
    ) => {
      // might DRY this up with preceding collectedFlags function
      const possibleFlags = flatFlags.filter((f) => f.category === category);
      const keys = possibleFlags.map((f) => f.value);
      const collectedFlags = Object.values(
        breadcrumbs
      ).flatMap(({ answers = [] }) =>
        answers.map((id) => flow[id]?.data?.flag)
      );

      const filteredCollectedFlags = collectedFlags
        .filter((flag) => flag && keys.includes(flag))
        .sort((a, b) => keys.indexOf(a) - keys.indexOf(b));

      const flag: Flag = possibleFlags.find(
        (f) => f.value === filteredCollectedFlags[0]
      ) || {
        // value: "PP-NO_RESULT",
        value: undefined,
        text: "No result",
        category,
        bgColor: "#EEEEEE",
        color: tinycolor("black").toHexString(),
        officerDescription: "",
      };

      const responses = Object.entries(breadcrumbs)
        .map(([k, { answers = [] }]) => {
          const question = { id: k, ...flow[k] };

          const questionType = question?.type;

          if (!questionType || !SUPPORTED_DECISION_TYPES.includes(questionType))
            return null;

          const selections = answers.map((id) => ({ id, ...flow[id] }));
          const hidden = !selections.some(
            (r) => r.data?.flag && r.data.flag === flag?.value
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
    {} as ReturnType<PreviewStore["resultData"]>
  );
};
