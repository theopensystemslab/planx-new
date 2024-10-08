import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import { debounce } from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

export type Props = {
  limit: number;
  count: number;
};

export const CharacterCounter: React.FC<Props> = ({ limit, count }) => {
  const [screenReaderCount, setScreenReaderCount] = useState<number>(0);
  const [showReaderCount, setShowReaderCount] = useState<boolean>(false);

  const updateCharacterCount = useCallback(
    debounce((count: number) => {
      setScreenReaderCount(count);
      setShowReaderCount(true);
    }, 500),
    []
  );

  const currentCharacterCount = limit - count;
  const showCharacterLimitError = currentCharacterCount < 0;

  useEffect(() => {
    if (count !== screenReaderCount) {
      setShowReaderCount(false);
    }
    updateCharacterCount(currentCharacterCount);
  }, [currentCharacterCount, updateCharacterCount, count, screenReaderCount]);

  const characterLimitText = showCharacterLimitError
    ? `You have ${Math.abs(currentCharacterCount)} characters too many`
    : `You have ${currentCharacterCount} characters remaining`;

  const screenReaderCountText = showCharacterLimitError
    ? `You have ${Math.abs(screenReaderCount)} characters too many`
    : `You have ${screenReaderCount} characters remaining`;

  return (
    <>
      <Typography
        id={"character-hint"}
        sx={visuallyHidden}
        aria-hidden={"true"}
      >
        {`You can enter up to ${limit} characters`}
      </Typography>
      <Typography
        paddingTop={0.5}
        variant="body2"
        color={showCharacterLimitError ? "error" : "InfoText"}
        fontWeight={showCharacterLimitError ? FONT_WEIGHT_SEMI_BOLD : 400}
        id={"character-live-hint"}
        aria-hidden={"true"}
      >
        {characterLimitText}
      </Typography>
      <Typography aria-live="polite" aria-atomic="true" sx={visuallyHidden}>
        {showReaderCount && screenReaderCountText}
      </Typography>
    </>
  );
};
