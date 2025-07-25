import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import ButtonBase from "@planx/components/shared/Buttons/ButtonBase";
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

const Root = styled(Box)(({ theme }) => ({
  background: theme.palette.background.default,
  boxShadow: "0 2px 6px 0 rgba(0, 0, 0, 0.2)",
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0.25),
  position: "absolute",
  zIndex: theme.zIndex.tooltip,
  gap: theme.spacing(0.1),
  overflow: "auto",
  flexDirection: "column",
  minWidth: "400px",
}));

const EmojiButton = styled(ButtonBase)(({ theme }) => ({
  alignItems: "center",
  gap: theme.spacing(1),
  display: "flex",
  textAlign: "left",
  width: "100%",
  "& img": {
    width: "2rem",
    height: "2rem",
    align: "absmiddle",
  },
}));

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
      <Root>
        {items.map((item, index) => (
          <EmojiButton
            selected={index === selectedIndex}
            key={index}
            onClick={() => selectItem(index)}
          >
            {item.fallbackImage ? (
              <img src={item.fallbackImage} alt={item.name} />
            ) : (
              <Typography style={{ fontSize: "2rem" }}>{item.emoji}</Typography>
            )}
            <Typography variant="body2">:{item.name}:</Typography>
          </EmojiButton>
        ))}
      </Root>
    );
  },
);
