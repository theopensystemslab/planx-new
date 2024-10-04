import Typography from "@mui/material/Typography";
import { debounce } from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

export type Props = {
  characterLimit: number;
  characterCount: number;
  error: boolean;
};

export const CharacterCounter: React.FC<Props> = (props) => {
  const [characterLimitAnnoucement, setCharacterLimitAnnoucement] =
    useState<number>(0);
  const [characterAnnouncementBool, setCharacterLimitAnnoucementBool] =
    useState<boolean>(false);

  const updateCharacterCount = useCallback(
    debounce((count: number) => {
      setCharacterLimitAnnoucement(props.characterLimit - count);
    }, 500),
    [],
  );

  useEffect(() => {
    updateCharacterCount(props.characterCount);
    setTimeout(() => {
      setCharacterLimitAnnoucementBool(true);
    }, 500);
    setCharacterLimitAnnoucementBool(false);
  }, [props.characterCount, updateCharacterCount]);

  const currentCharacterCount = props.characterLimit - props.characterCount;
  const characterLimitBool = currentCharacterCount > 0;
  const characterLimitText = characterLimitBool
    ? `You have ${currentCharacterCount} characters remaining`
    : `You have ${Math.abs(currentCharacterCount)} characters too many`;

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
        aria-hidden={props.characterCount === 0 ? false : true}
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
        aria-atomic="true"
        sx={{
          position: "absolute",
          height: "1px",
          width: "1px",
          overflow: "hidden",
        }}
        aria-hidden={characterAnnouncementBool ? false : true}
      >{`You have ${characterLimitAnnoucement} characters remaining`}</Typography>
    </>
  );
};
