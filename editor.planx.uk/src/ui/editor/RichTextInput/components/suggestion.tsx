import { ReactRenderer } from "@tiptap/react";
import tippy, { type Instance } from "tippy.js";

import { useVariablesStore } from "./../utils";
import { MentionList } from "./MentionList";

// Implemented based on the mention plugin example code snippets: https://tiptap.dev/api/nodes/mention
export const suggestion = {
  items: ({ query }: { query: string }) => {
    return useVariablesStore
      .getState()
      .variables.filter((item) =>
        item.toLowerCase().includes(query.toLowerCase()),
      )
      .slice(0, 5);
  },

  render: () => {
    let component: undefined | ReactRenderer<any, any>;
    let popup: Instance[] | undefined;

    return {
      onStart: (props: any) => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) {
          return;
        }

        popup = tippy("body", {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
        });
      },

      onUpdate(props: any) {
        component?.updateProps(props);

        if (!props.clientRect) {
          return;
        }

        popup?.[0]?.setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      onKeyDown(props: any) {
        if (props.event.key === "Escape") {
          popup?.[0]?.hide();
          return true;
        }

        return component?.ref?.onKeyDown(props);
      },

      onExit() {
        popup?.[0]?.destroy();
        component?.destroy();
      },
    };
  },
};
