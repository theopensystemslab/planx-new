import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";

import { MentionItems, MentionItemsButton, MentionItemsEmpty } from "../styles";
import { passportClassName } from "../tiptapExtensions";
import { MentionListProps } from "../types";
import { useVariablesStore } from "../utils";

// Implemented based on the mention plugin example code snippets: https://tiptap.dev/api/nodes/mention
export const MentionList = forwardRef((props: MentionListProps, ref) => {
  const variablesStore = useVariablesStore();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];

    if (item) {
      props.command({ id: item });
    }
  };

  const upHandler = () => {
    setSelectedIndex(
      (selectedIndex + props.items.length - 1) % props.items.length,
    );
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: any) => {
      if (event.key === "ArrowUp") {
        upHandler();
        return true;
      }

      if (event.key === "ArrowDown") {
        downHandler();
        return true;
      }

      if (event.key === "Enter") {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <MentionItems>
      {props.query.length > 0 && (
        <MentionItemsButton
          variant="text"
          onClick={() => {
            props.command({ id: props.query });
            variablesStore.addVariable(props.query);
          }}
        >
          + Add <span className={passportClassName}>@{props.query}</span>
        </MentionItemsButton>
      )}
      {props.items.length > 0 ? (
        props.items.map((item: any, index: number) => (
          <MentionItemsButton
            variant="text"
            className={`mention-item ${
              index === selectedIndex ? "mention-item-selected" : ""
            }`}
            key={index}
            onClick={() => selectItem(index)}
          >
            <span className={passportClassName}>@{item}</span>
          </MentionItemsButton>
        ))
      ) : (
        <MentionItemsEmpty variant="body2">No results</MentionItemsEmpty>
      )}
    </MentionItems>
  );
});
