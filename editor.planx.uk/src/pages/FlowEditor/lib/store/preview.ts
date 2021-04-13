import { gql } from "@apollo/client";
import tinycolor from "@ctrl/tinycolor";
import { TYPES } from "@planx/components/types";
import { sortIdsDepthFirst } from "@planx/graph";
import { client } from "lib/graphql";
import difference from "lodash/difference";
import flatten from "lodash/flatten";
import uniq from "lodash/uniq";
import pgarray from "pg-array";
import type { Flag } from "types";
import type { GetState, SetState } from "zustand/vanilla";

import { DEFAULT_FLAG_CATEGORY, flatFlags } from "../../data/flags";
import type { Store } from ".";
import type { SharedStore } from "./shared";

const SUPPORTED_DECISION_TYPES = [TYPES.Checklist, TYPES.Statement];

export interface PreviewStore extends Store.Store {
  collectedFlags: (
    upToNodeId: Store.nodeId,
    visited?: Array<string>
  ) => Array<string>;
  currentCard: () => Store.node | null;
  hasPaid: () => boolean;
  computePassport: () => Readonly<Store.passport>;
  previousCard: () => Store.nodeId | undefined;
  record: (
    id: Store.nodeId,
    {
      answers,
      data,
    }?: { answers?: Store.userData["answers"]; data?: Store.userData["data"] }
  ) => void;
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
  startSession: ({ passport }: { passport: Store.passport }) => void;
  upcomingCardIds: () => Store.nodeId[];
}

// export const previewStore = vanillaCreate<PreviewStore>((set, get) => ({
export const previewStore = (
  set: SetState<PreviewStore>,
  get: GetState<SharedStore & PreviewStore>
): PreviewStore => ({
  collectedFlags(upToNodeId, visited = []) {
    const { breadcrumbs, flow } = get();

    // TODO: Should this be all flags?
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

    return Object.keys(breadcrumbs).some(
      (crumb) => flow[crumb].type === TYPES.Pay
    );
  },

  previousCard: () => {
    const goBackable = Object.entries(get().breadcrumbs)
      .filter(([k, v]: any) => !v.auto)
      .map(([k]) => k);

    return goBackable.pop();
  },

  computePassport: () =>
    Object.values(get().breadcrumbs).reduce(
      (acc, { data = {} }) => {
        return {
          ...acc,
          data: {
            ...acc.data,
            ...Object.entries(data).reduce((_acc, [id, value]) => {
              _acc![id] = { value };
              return _acc;
            }, {} as Store.passport["data"]),
          },
        };
      },
      {
        data: {},
      } as Store.passport
    ),

  record(id, userData) {
    const {
      breadcrumbs,
      sessionId,
      upcomingCardIds,
      flow,
      computePassport,
    } = get();

    const passport = computePassport();

    if (!flow[id]) throw new Error("id not found");

    if (userData) {
      const { answers = [], data = {} } = userData;

      const key = flow[id].data?.fn;
      if (key) {
        let passportValue = answers.map((id: string) => flow[id]?.data?.val);

        passportValue = passportValue.filter(
          (val: any) =>
            val !== undefined && val !== null && String(val).trim() !== ""
        );

        if (passportValue.length > 0) {
          if (passport.data?.[key] && Array.isArray(passport.data[key].value)) {
            // const allValues = uniq(
            //   passport.data?[key].value.concat(passportValue)
            // ).sort() as Array<string>;

            const allValues: Array<string> = [];

            passportValue = allValues.reduce((acc: Array<string>, curr) => {
              if (allValues.some((x) => !x.startsWith(curr))) {
                acc.push(curr);
              }
              return acc;
            }, []);
          }

          set({
            breadcrumbs: {
              ...breadcrumbs,
              [id]: { answers, data, auto: false },
            },
            passport: {
              ...passport,
              data: {
                ...passport.data,
                [key]: passportValue,
              },
            },
          });
        } else {
          set({
            breadcrumbs: {
              ...breadcrumbs,
              [id]: { answers, data, auto: false },
            },
          });
        }
      } else {
        set({
          breadcrumbs: {
            ...breadcrumbs,
            [id]: { answers, data, auto: false },
          },
        });
      }

      const flowIdType = flow[id]?.type;

      // only store breadcrumbs in the backend if they are answers provided for
      // either a Statement or Checklist type. TODO: make this more robust
      if (
        flowIdType &&
        SUPPORTED_DECISION_TYPES.includes(flowIdType) &&
        sessionId
      ) {
        addSessionEvent();
        if (upcomingCardIds().length === 0) {
          endSession();
        }
      }
    } else {
      // remove breadcrumbs that were stored from id onwards
      let keepBreadcrumb = true;

      const data: Store.passport["data"] = {};

      const newBreadcrumbs = Object.entries(breadcrumbs).reduce(
        (acc: Record<string, any>, [questionId, v]) => {
          if (questionId === id) {
            keepBreadcrumb = false;
          } else if (keepBreadcrumb) {
            acc[questionId] = v;

            const fn = flow[questionId]?.data?.fn;
            if (fn) {
              const { answers: localAnswers = [] } = v;

              const value = localAnswers
                .map((aId: string) => flow[aId]?.data?.val)
                .filter(Boolean);

              if (value) {
                data[fn] = { value };
              }
            }
          }
          return acc;
        },
        {}
      );

      set({
        breadcrumbs: newBreadcrumbs,
        passport: {
          ...passport,
          data,
        },
      });
    }

    function addSessionEvent() {
      client.mutate({
        mutation: gql`
          mutation CreateSessionEvent(
            $chosen_node_ids: _text
            $type: session_event_type
            $session_id: uuid
            $parent_node_id: String
          ) {
            insert_session_events_one(
              object: {
                chosen_node_ids: $chosen_node_ids
                session_id: $session_id
                type: $type
                parent_node_id: $parent_node_id
              }
            ) {
              id
            }
          }
        `,
        variables: {
          chosen_node_ids: pgarray(userData?.answers ?? []),
          session_id: get().sessionId,
          type: "human_decision", // TODO
          parent_node_id: id,
        },
      });
    }

    function endSession() {
      client.mutate({
        mutation: gql`
          mutation EndSession($id: uuid!, $completed_at: timestamptz!) {
            update_sessions_by_pk(
              pk_columns: { id: $id }
              _set: { completed_at: $completed_at }
            ) {
              id
            }
          }
        `,
        variables: {
          id: get().sessionId,
          // TODO: Move this logic to the backend
          //       Could be done with a SQL Function exposed through Hasura as a mutation (e.g. end_session)
          completed_at: new Date(),
        },
      });
    }
  },

  resultData(flagSet = DEFAULT_FLAG_CATEGORY, overrides) {
    const { breadcrumbs, flow } = get();

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
        // TODO: DRY this up with preceding collectedFlags function?
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

        const flag = possibleFlags.find(
          (f) => f.value === filteredCollectedFlags[0]
        ) || {
          // value: "PP-NO_RESULT",
          value: undefined,
          text: "No result",
          category,
          bgColor: "#EEEEEE",
          color: tinycolor("black").toHexString(),
        };

        const responses = Object.entries(breadcrumbs)
          .map(([k, { answers = [] }]) => {
            const question = { id: k, ...flow[k] };

            const questionType = question?.type;

            if (
              !questionType ||
              !SUPPORTED_DECISION_TYPES.includes(questionType)
            )
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
      {}
    );
  },

  resumeSession(args) {
    set(args);
  },

  sessionId: "",

  async startSession({ passport }) {
    // // ------ BEGIN PASSPORT DATA OVERRIDES ------

    // // TODO: move all of the logic in this block out of here and update the API

    // // In this block we are converting the vars stored in passport.data object
    // // from the old boolean values style to the new array style. This should be
    // // done on a server but as a temporary fix the data is currently being
    // // converted here.

    // // More info:
    // // GitHub comment explaining what's happening here https://bit.ly/2HFnxX2
    // // Google sheet with new passport schema https://bit.ly/39eYp4A

    // // https://tinyurl.com/3cdrnr7j

    // // converts what is here
    // // https://gist.github.com/johnrees/e0e3197e3915489a69c743b38faf489e
    // // into { 'property.constraints.planning': { value: ['property.landConservation'] } }
    // const constraintsDictionary = {
    //   "property.article4.lambeth.albertsquare": "article4.lambeth.albert",
    //   "property.article4.lambeth.hydefarm": "article4.lambeth.hydeFarm",
    //   "property.article4.lambeth.lansdowne": "article4.lambeth.lansdowne",
    //   "property.article4.lambeth.leighamcourt": "article4.lambeth.leigham",
    //   "property.article4.lambeth.parkhallroad": "article4.lambeth.parkHall",
    //   "property.article4.lambeth.stockwell": "article4.lambeth.stockwell",
    //   "property.article4.lambeth.streatham": "article4.lambeth.streatham",
    //   "property.article4s": "article4",
    //   "property.buildingListed": "listed",
    //   "property.landAONB": "designated.AONB",
    //   "property.landBroads": "designated.broads",
    //   "property.landConservation": "designated.conservationArea",
    //   "property.landExplosivesStorage": "defence.explosives",
    //   "property.landNP": "designated.nationalPark",
    //   "property.landSafeguarded": "defence.safeguarded",
    //   "property.landSafetyHazard": "hazard",
    //   "property.landSSI": "nature.SSSI",
    //   "property.landTPO": "tpo",
    //   "property.landWHS": "designated.WHS",
    //   "property.southwarkSunrayEstate": "article4.southwark.sunray",
    // };

    // const newPassportData = Object.entries(constraintsDictionary).reduce(
    //   (dataObject, [oldName, newName]) => {
    //     if (passport.data?.[oldName]?.value) {
    //       dataObject["property.constraints.planning"] = dataObject[
    //         "property.constraints.planning"
    //       ] ?? { value: [] };
    //       dataObject["property.constraints.planning"].value.push(newName);
    //     }
    //     return dataObject;
    //   },
    //   {
    //     ...(get().passport.data || {}),
    //   }
    // );

    // if (passport.info?.planx_value) {
    //   newPassportData["property.type"] = {
    //     value: [passport.info.planx_value],
    //   };
    // }

    // set({
    //   passport: {
    //     ...passport,
    //     data: newPassportData,
    //   },
    // });

    // // ------ END PASSPORT DATA OVERRIDES ------

    try {
      const response = await client.mutate({
        mutation: gql`
          mutation CreateSession(
            $flow_data: jsonb
            $flow_id: uuid
            $flow_version: Int
            $passport: jsonb
          ) {
            insert_sessions_one(
              object: {
                flow_data: $flow_data
                flow_id: $flow_id
                flow_version: $flow_version
                passport: $passport
              }
            ) {
              id
            }
          }
        `,
        variables: {
          flow_data: get().flow,
          flow_id: get().id,
          flow_version: 0, // TODO: add flow version
          passport,
        },
      });
      const sessionId = response.data.insert_sessions_one.id;
      set({ sessionId });
    } catch (e) {}
  },

  upcomingCardIds() {
    const { flow, breadcrumbs, computePassport, collectedFlags } = get();

    const passport = computePassport();

    const knownNotVals = Object.entries(breadcrumbs).reduce(
      (acc, [id, { answers = [] }]) => {
        if (!flow[id]) return acc;

        const _knownNotVals = difference(
          flow[id].edges,
          answers as Array<Store.nodeId>
        );

        acc[flow[id].data?.fn] = uniq(
          flatten([
            ...(acc[flow[id].data?.fn] || []),
            _knownNotVals.flatMap((n) => flow[n].data?.val),
          ])
        ).filter(Boolean) as Array<Store.nodeId>;

        return acc;
      },
      {} as Record<Store.nodeId, Array<Store.nodeId>>
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

          if (
            node.type &&
            [TYPES.InternalPortal, TYPES.Page].includes(node.type)
          ) {
            return nodeIdsConnectedFrom(id);
          }

          const fn = node.type === TYPES.Filter ? "flag" : node.data?.fn;

          const [globalFlag] = collectedFlags(id, Array.from(visited));

          let passportValues =
            fn === "flag" ? globalFlag : passport.data?.[fn]?.value?.sort();

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
                (r) => !knownNotVals[fn]?.includes(r.data.val)
              );
              if (_responses.length === 1) {
                responsesThatCanBeAutoAnswered = _responses;
              } else if (
                !passport.data?.[fn] ||
                passport.data?.[fn].value.length > 0
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
});
