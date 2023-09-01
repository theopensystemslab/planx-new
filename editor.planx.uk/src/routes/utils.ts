import { TYPES as NodeTypes } from "@planx/components/types";
import gql from "graphql-tag";
import { hasFeatureFlag } from "lib/featureFlags";
import { NaviRequest, NotFoundError } from "navi";
import pMemoize from "p-memoize";
import { useStore } from "pages/FlowEditor/lib/store";
import { ApplicationPath } from "types";

import { publicClient } from "../lib/graphql";

export const makeTitle = (str: string) =>
  [str, "PlanX"].filter(Boolean).join(" | ");

export const rootFlowPath = (includePortals = false) => {
  const path = window.location.pathname.split("/").slice(0, 3).join("/");
  return includePortals ? path : path.split(",")[0];
};

export const isSaveReturnFlow = (flowData: Record<string, any>): boolean =>
  Boolean(
    Object.values(flowData).find(
      (node: Record<string, any>) => node.type === NodeTypes.Send,
    ),
  );

export const setPath = (flowData: Record<string, any>, req: NaviRequest) => {
  // XXX: store.path is SingleSession by default
  if (!isSaveReturnFlow(flowData)) return;
  if (hasFeatureFlag("DISABLE_SAVE_AND_RETURN")) return;
  const isEmailCaptured = Boolean(useStore.getState().saveToEmail);
  const path =
    req.params.sessionId && !isEmailCaptured
      ? ApplicationPath.Resume
      : ApplicationPath.SaveAndReturn;
  useStore.setState({ path });
};

//
// XXX: Why does `isPreviewOnlyDomain` contain hard-coded values?
//
//      Ideally, we'd want to get rid of these hard-coded domain names in favour of inferring them by calling getTeamFromDomain.
//      Here's some pseudo-code:
//
//          const isPreviewOnlyDomain = Boolean(await getTeamFromDomain(window.location.hostname))
//
//      Unfortunately, it's not that easy. The `isPreviewOnlyDomain` variable is easy to inject, and access from context (or even from global variable) for all of the code but the `store`. The `store` is initialized as soon as the application comes up and depends on `isPreviewOnlyDomain` to be created. There are a couple of solutions I could think of, but they are either too much of a workaround or require too much refactoring:
//      1. Lazy initialisation of the variables, using async to get the team, and then setting the exported values based on the result. The problem here is the bad practice of exporting a mutable `let` variable.
//      2. Using `zustand`'s [Context](https://github.com/pmndrs/zustand#react-context). We could initialize the store inside a component and take advantage of a `useEffect`, populate the store, and then render the `Provider` as soon as the store was ready. I tried doing this, but the `useStore` exported from `createContext` is a hook, and cannot be used outside React, therefore, we would have to refactor all functions that use `useStore.getState` to receive it as a prop, instead of accessing it directly.
//      3. Since the store is loaded only once and right after the application is up, even if we used a global variable it would not be initialized yet.
//
//      So I've hard-coded these domain names until a better solution comes along.
//
const PREVIEW_ONLY_DOMAINS = [
  "planningservices.buckinghamshire.gov.uk",
  "planningservices.lambeth.gov.uk",
  "planningservices.southwark.gov.uk",
  "planningservices.doncaster.gov.uk",
  "planningservices.medway.gov.uk",
  // XXX: un-comment the next line to test custom domains locally
  // "localhost",
];
export const isPreviewOnlyDomain = PREVIEW_ONLY_DOMAINS.some((domain) =>
  window.location.hostname.endsWith(domain),
);

const QUERY_GET_TEAM_BY_DOMAIN = gql`
  query GetTeamByDomain($domain: String!) {
    teams(limit: 1, where: { domain: { _eq: $domain } }) {
      slug
    }
  }
`;

export const getTeamFromDomain = pMemoize(async (domain: string) => {
  const {
    data: { teams },
  } = await publicClient.query({
    query: QUERY_GET_TEAM_BY_DOMAIN,
    variables: {
      domain,
    },
  });

  return teams?.[0]?.slug;
});

/**
 * Prevents accessing a different team than the one associated with the custom domain.
 * e.g. Custom domain is for Southwark but URL is looking for Lambeth
 * e.g. https://planningservices.southwark.gov.uk/lambeth/some-flow/preview
 */
export const validateTeamRoute = async (req: NaviRequest) => {
  const externalTeamName = await getTeamFromDomain(window.location.hostname);
  if (
    req.params.team &&
    externalTeamName &&
    externalTeamName !== req.params.team
  )
    throw new NotFoundError(req.originalUrl);
};
