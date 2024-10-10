import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import { TEXT_LIMITS, TextInputType } from "@planx/components/TextInput/model";
import { debounce } from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

export type Props = {
  limit: TextInputType.Long | TextInputType.ExtraLong;
  count: number;
  error: boolean;
};

export const CharacterCounter: React.FC<Props> = ({ limit, count, error }) => {
  const [screenReaderCount, setScreenReaderCount] = useState<number>(0);
  const [showReaderCount, setShowReaderCount] = useState<boolean>(false);

  const updateCharacterCount = useCallback(
    debounce((count: number) => {
      setScreenReaderCount(count);
      setShowReaderCount(true);
    }, 500),
    []
  );

  const currentCharacterCount = TEXT_LIMITS[limit] - count;
  const showCharacterLimitError = currentCharacterCount < 0;

  useEffect(() => {
    if (count !== screenReaderCount) {
      setShowReaderCount(false);
    }
    if (count > 0) {
      updateCharacterCount(currentCharacterCount);
    }
  }, [currentCharacterCount, updateCharacterCount, count, screenReaderCount]);

  const characterLimitText = showCharacterLimitError
    ? `You have ${Math.abs(currentCharacterCount)} characters too many`
    : `You have ${currentCharacterCount} characters remaining`;

  const screenReaderCountText = showCharacterLimitError
    ? `You have ${Math.abs(screenReaderCount)} characters too many`
    : `You have ${screenReaderCount} characters remaining`;

  return (
    <>
      <Typography id={"character-hint"} sx={visuallyHidden} aria-hidden={true}>
        {`You can enter up to ${TEXT_LIMITS[limit]} characters`}
      </Typography>
      <Typography
        paddingTop={0.5}
        variant="body2"
        color={showCharacterLimitError ? "error" : "InfoText"}
        fontWeight={showCharacterLimitError ? FONT_WEIGHT_SEMI_BOLD : 400}
        id={"character-live-hint"}
        aria-hidden={"true"}
        paddingLeft={error ? 2 : 0}
      >
        {characterLimitText}
      </Typography>
      <Typography
        aria-live="polite"
        aria-atomic="true"
        sx={visuallyHidden}
        data-testid="screen-reader-count"
        aria-hidden={count === 0 ? true : false}
      >
        {showReaderCount && screenReaderCountText}
      </Typography>
    </>
  );
};
