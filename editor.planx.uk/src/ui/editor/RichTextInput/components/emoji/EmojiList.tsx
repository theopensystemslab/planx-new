import "./EmojiList.scss";

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";

interface EmojiItem {
  name: string;
  emoji: string;
  fallbackImage?: string;
}

interface EmojiListProps {
  items: EmojiItem[];
  command: (item: { name: string }) => void;
}

export interface EmojiListRef {
  onKeyDown: (x: { event: KeyboardEvent }) => boolean;
}

export const EmojiList = forwardRef<EmojiListRef, EmojiListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = useCallback(
      (index: number): void => {
        const item = items[index];

        if (item) {
          command({ name: item.name });
        }
      },
      [items, command],
    );

    const upHandler = useCallback((): void => {
      setSelectedIndex((selectedIndex + items.length - 1) % items.length);
    }, [selectedIndex, items.length]);

    const downHandler = useCallback((): void => {
      setSelectedIndex((selectedIndex + 1) % items.length);
    }, [selectedIndex, items.length]);

    const enterHandler = useCallback((): void => {
      selectItem(selectedIndex);
    }, [selectItem, selectedIndex]);

    useEffect(() => setSelectedIndex(0), [items]);

    useImperativeHandle(ref, () => {
      return {
        onKeyDown: (x: { event: KeyboardEvent }): boolean => {
          if (x.event.key === "ArrowUp") {
            upHandler();
            return true;
          }

          if (x.event.key === "ArrowDown") {
            downHandler();
            return true;
          }

          if (x.event.key === "Enter") {
            enterHandler();
            return true;
          }

          return false;
        },
      };
    }, [upHandler, downHandler, enterHandler]);

    return (
      <div className="dropdown-menu">
        {items.map((item, index) => (
          <button
            className={index === selectedIndex ? "is-selected" : ""}
            key={index}
            onClick={() => selectItem(index)}
          >
            {item.fallbackImage ? (
              <img
                src={item.fallbackImage}
                // align="absmiddle"
                alt="TEMP TEST"
              />
            ) : (
              item.emoji
            )}
            :{item.name}:
          </button>
        ))}
      </div>
    );
  },
);
