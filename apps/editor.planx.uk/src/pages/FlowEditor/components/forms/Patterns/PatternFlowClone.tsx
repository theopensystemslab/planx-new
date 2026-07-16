/* eslint-disable jsx-a11y/anchor-is-valid --
   The <a> tags below are required for the floweditor.scss `& a { ... }`
   selectors to apply, but this whole tree is mounted off-screen and
   aria-hidden purely to be measured/painted to a canvas - it's never
   shown or reachable, so it isn't a real navigation/accessibility surface. */
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { COMPONENT_TITLES } from "@planx/components/shared/componentTitles";
import type { Graph } from "@planx/graph";
import { ROOT_NODE_KEY } from "@planx/graph";
import React from "react";

// These render the real flow editor's branching (Question/Checklist) as a
// "question" card rather than a "type-X" card - see Checklist.tsx
const QUESTION_LIKE_TYPES = new Set<TYPES>([
  TYPES.Question,
  TYPES.ResponsiveQuestion,
  TYPES.Checklist,
  TYPES.ResponsiveChecklist,
]);

const labelFor = (nodeId: string, graph: Graph): string => {
  const node = graph[nodeId];
  const data = (node?.data ?? {}) as Record<string, unknown>;
  return (
    (data.title as string) ||
    (data.text as string) ||
    COMPONENT_TITLES[node?.type as TYPES] ||
    ""
  );
};

interface CloneNodeProps {
  id: string;
  graph: Graph;
  visited: Set<string>;
}

// Every real node is preceded by a Hanger sibling (see Hanger.tsx) - this is
// what actually draws the connecting line + circle between components, not
// any styling on the surrounding <ol>
const HangerLi: React.FC = () => (
  <li className="hanger">
    <button type="button" />
  </li>
);

const CloneNode: React.FC<CloneNodeProps> = ({ id, graph, visited }) => {
  if (visited.has(id)) return null;
  visited.add(id);

  const node = graph[id];
  if (!node) return null;

  const type = node.type as TYPES;
  const label = labelFor(id, graph);
  const childIds = node.edges ?? [];

  // Answer / checklist option - branches back out into its own children.
  // Real Option.tsx always renders its <ol class="decisions"> with a
  // trailing Hanger, even with zero children, so it's never CSS `:empty`
  // and always shows a connector below the option.
  if (type === TYPES.Answer) {
    return (
      <>
        <HangerLi />
        <li className="card option" data-node-id={id}>
          <a>
            <div className="text">{label}</div>
          </a>
          <ol className="decisions">
            {childIds.map((childId) => (
              <CloneNode
                key={childId}
                id={childId}
                graph={graph}
                visited={visited}
              />
            ))}
            <HangerLi />
          </ol>
        </li>
      </>
    );
  }

  // Folders are a page-break in the real editor - not expanded inline
  if (type === TYPES.InternalPortal) {
    return (
      <>
        <HangerLi />
        <li className="folder" data-node-id={id}>
          <div className="card portal internal-portal">
            <a>
              <span>{label}</span>
            </a>
          </div>
        </li>
      </>
    );
  }

  // Nested flows live in a different flow entirely - not expanded inline
  if (type === TYPES.ExternalPortal) {
    return (
      <>
        <HangerLi />
        <li className="card portal external-portal" data-node-id={id}>
          <a>
            <span>{label}</span>
          </a>
        </li>
      </>
    );
  }

  const cardClassName = QUESTION_LIKE_TYPES.has(type)
    ? "card decision question"
    : `card decision type-${TYPES[type]}`;

  return (
    <>
      <HangerLi />
      <li className={cardClassName} data-node-id={id}>
        <div className="card-wrapper">
          <a>
            <span>{label}</span>
          </a>
        </div>
        {childIds.length > 0 && (
          <ol className="options">
            {childIds.map((childId) => (
              <CloneNode
                key={childId}
                id={childId}
                graph={graph}
                visited={visited}
              />
            ))}
          </ol>
        )}
      </li>
    </>
  );
};

const CloneRoot = styled(Box)({
  display: "inline-flex",
  flexDirection: "column",
  alignItems: "center",
  fontSize: 13,
  // Mirrors the real editor's #editor ol/li reset, scoped to this clone only
  "& ol, & li": {
    listStyle: "none",
    padding: 0,
    margin: "0 auto",
    width: "max-content",
  },
});

interface PatternFlowCloneProps {
  graph: Graph;
}

/**
 * Renders the minimal read-only DOM structure (classnames only, no drag
 * handlers/links/store access) that the real flow editor produces for a
 * given node graph, so the shared floweditor.scss cascade lays it out the
 * same way. Meant to be mounted off-screen purely to measure and paint a
 * thumbnail - never shown directly, never interactive.
 */
export const PatternFlowClone: React.FC<PatternFlowCloneProps> = ({
  graph,
}) => {
  const visited = new Set<string>([ROOT_NODE_KEY]);
  const rootChildIds = graph[ROOT_NODE_KEY]?.edges ?? [];

  return (
    <CloneRoot data-layout="top-down" aria-hidden inert>
      <ol>
        {rootChildIds.map((id) => (
          <CloneNode key={id} id={id} graph={graph} visited={visited} />
        ))}
      </ol>
    </CloneRoot>
  );
};
