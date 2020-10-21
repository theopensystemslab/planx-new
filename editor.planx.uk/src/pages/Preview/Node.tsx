import mapAccum from "ramda/src/mapAccum";
import React, { Suspense } from "react";
import { TYPES } from "../FlowEditor/data/types";
import { useStore } from "../FlowEditor/lib/store";

const LazyNode: React.FC = ({ children }) => (
  <Suspense fallback={<div>Loading</div>}>{children}</Suspense>
);

interface NodeType {
  component?: string;
  props: () => object;
}

let uprn; // TODO: move this to zustand state!

const Node: React.FC<any> = (props) => {
  const [childNodesOf, flagResult, responsesForReport] = useStore((state) => [
    state.childNodesOf,
    state.flagResult,
    state.responsesForReport,
  ]);

  const nodeTypes: Record<string, NodeType> = {
    Statement: {
      component: "Question",
      props: () => ({
        node: props.node,
        handleClick: props.handleSubmit,
        responses: childNodesOf(props.id).map((n, i) => ({
          id: n.id,
          responseKey: i + 1,
          title: n.text,
        })),
      }),
    },
    Result: {
      props: () => {
        const flag = flagResult();
        return {
          handleSubmit: props.handleSubmit,
          headingColor: {
            text: flag.color.toHexString(),
            background: flag.bgColor,
          },
          headingTitle: flag.text,
          subheading: "",
          reasonsTitle: "Responses",
          responses: [
            {
              "Planning permission": responsesForReport(),
            },
          ],
        };
      },
    },
    TaskList: {
      props: () => ({
        node: props.node,
        tasks: props.taskList.tasks,
        handleSubmit: props.handleSubmit,
      }),
    },
    Notice: {
      props: () => props,
    },
    FileUpload: {
      component: "FileUpload/FileUpload", // dynamic import ignores package.json
      props: () => props,
    },
    Content: {
      props: () => props,
    },
    Checklist: {
      props: () => {
        const childNodes = childNodesOf(props.node.id);

        return {
          node: props.node,
          info: props.info,
          text: props.text,
          description: props.description,
          allRequired: props.allRequired,
          handleSubmit: props.handleSubmit,
          options: props.node.categories ? undefined : childNodes,
          groupedOptions: !props.node.categories
            ? undefined
            : mapAccum(
                (index: number, category: { title: string; count: number }) => [
                  index + category.count,
                  {
                    title: category.title,
                    children: childNodes.slice(index, index + category.count),
                  },
                ],
                0,
                props.node.categories
              )[1],
        };
      },
    },
    FindProperty: {
      props: () => ({
        handleSubmit: (data) => {
          uprn = data;
          props.handleSubmit([props.id]);
        },
      }),
    },
    PropertyInformation: {
      props: () => ({
        UPRN: uprn,
        handleSubmit: () => props.handleSubmit([props.id]),
      }),
    },
  };

  for (let [type, node] of Object.entries(nodeTypes)) {
    if (TYPES[type] && props.$t === TYPES[type]) {
      const Component = React.lazy(
        () => import(`./components/${node.component || type}`)
      );
      const componentProps = node.props();
      return (
        <LazyNode>
          <Component {...componentProps} />
        </LazyNode>
      );
    }
  }

  console.error({ nodeNotFound: props });
  return null;
};

export default Node;
