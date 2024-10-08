import Typography from "@mui/material/Typography";
import { debounce } from "lodash";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

export type Props = {
  limit: number;
  count: number;
};

export const CharacterCounter: React.FC<Props> = ({ limit, count }) => {
  const [characterLimitAnnouncement, setCharacterLimitAnnouncement] =
    useState<number>(0);

  const updateCharacterCount = useCallback(
    debounce((count: number) => {
      setCharacterLimitAnnouncement(count);
    }, 300),
    []
  );

  const currentCharacterCount = limit - count;
  const showCharacterLimitError = currentCharacterCount > 0;

  useEffect(() => {
    updateCharacterCount(currentCharacterCount);
  }, [currentCharacterCount, updateCharacterCount]);

  const characterLimitText = showCharacterLimitError
    ? `You have ${Math.abs(currentCharacterCount)} characters too many`
    : `You have ${currentCharacterCount} characters remaining`;

  const characterLimitAnnouncementText = showCharacterLimitError
    ? `You have ${Math.abs(characterLimitAnnouncement)} characters too many`
    : `You have ${characterLimitAnnouncement} characters remaining`;

  return (
    <>
      <Typography
        id={"character-hint"}
        sx={{
          position: "absolute",
          height: "1px",
          width: "1px",
          overflow: "hidden",
        }}
        aria-hidden={true}
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
      <Typography
        aria-live="polite"
        sx={{
          position: "absolute",
          height: "1px",
          width: "1px",
          overflow: "hidden",
        }}
      >
        {characterLimitAnnouncementText}
      </Typography>
    </>
  );
};
