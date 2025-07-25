import { computePosition } from "@floating-ui/dom";
import { EmojiOptions } from "@tiptap/extension-emoji";
import { ReactRenderer } from "@tiptap/react";

import { EmojiList, EmojiListRef } from "./EmojiList.js";

const EmojiSuggestions: EmojiOptions["suggestion"] = {
  items: ({ editor, query }) => {
    return editor.storage.emoji.emojis
      .filter(({ shortcodes, tags }) => {
        return (
          shortcodes.find((shortcode) =>
            shortcode.startsWith(query.toLowerCase()),
          ) || tags.find((tag) => tag.startsWith(query.toLowerCase()))
        );
      })
      .slice(0, 5);
  },

  allowSpaces: false,

  render: () => {
    let component: ReactRenderer;

    function repositionComponent(clientRect: DOMRect | null) {
      if (!component || !component.element || !clientRect) {
        return;
      }

      const virtualElement = {
        getBoundingClientRect() {
          return clientRect;
        },
      };

      computePosition(virtualElement, component.element as HTMLElement, {
        placement: "bottom-start",
      }).then((pos) => {
        Object.assign((component.element as HTMLElement).style, {
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          position: pos.strategy === "fixed" ? "fixed" : "absolute",
        });
      });
    }

    return {
      onStart: (props) => {
        component = new ReactRenderer(EmojiList, {
          props,
          editor: props.editor,
        });

        document.body.appendChild(component.element);
        props.clientRect && repositionComponent(props.clientRect());
      },

      onUpdate(props) {
        component.updateProps(props);
        props.clientRect && repositionComponent(props.clientRect());
      },

      onKeyDown(props) {
        if (props.event.key === "Escape") {
          document.body.removeChild(component.element);
          component.destroy();

          return true;
        }

        return (component.ref as EmojiListRef).onKeyDown(props);
      },

      onExit() {
        if (document.body.contains(component.element)) {
          document.body.removeChild(component.element);
        }
        component.destroy();
      },
    };
  },
};

export default EmojiSuggestions;
