import Typography from "@mui/material/Typography";
import { debounce } from "lodash";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

export type Props = {
  characterLimit: number;
  characterCount: number;
  error: boolean;
};

export const CharacterCounter: React.FC<Props> = (props) => {
  const [characterLimitAnnouncement, setCharacterLimitAnnouncement] =
    useState<number>(0);

  const hintTextBool = useRef(true);
  const updateCharacterCount = useCallback(
    debounce((count: number) => {
      setCharacterLimitAnnouncement(count);
    }, 300),
    [],
  );

  const currentCharacterCount = props.characterLimit - props.characterCount;
  const characterLimitBool = currentCharacterCount > 0;

  useEffect(() => {
    updateCharacterCount(currentCharacterCount);
  }, [currentCharacterCount, updateCharacterCount]);

  const characterLimitText = characterLimitBool
    ? `You have ${currentCharacterCount} characters remaining`
    : `You have ${Math.abs(currentCharacterCount)} characters too many`;

  const characterLimitAnnouncementText = characterLimitBool
    ? `You have ${characterLimitAnnouncement} characters remaining`
    : `You have ${Math.abs(characterLimitAnnouncement)} characters too many`;

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
        aria-hidden={hintTextBool ? true : false}
      >
        {`You can enter up to ${props.characterLimit} characters`}
      </Typography>
      <Typography
        paddingTop={0.5}
        variant="body2"
        color={characterLimitBool ? "InfoText" : "error"}
        fontWeight={characterLimitBool ? 400 : FONT_WEIGHT_SEMI_BOLD}
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
