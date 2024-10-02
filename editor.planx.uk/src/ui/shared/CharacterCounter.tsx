import Typography from "@mui/material/Typography";
import { debounce } from "lodash";
import React, { useCallback, useEffect, useState } from "react";

export type Props = {
  characterLimit: number;
  characterCount: number;
  error: boolean;
};

// TODO: fix this data field bug for all components
export const CharacterCounter: React.FC<Props> = (props) => {
  const [characterLimitAnnoucement, setCharacterLimitAnnoucement] =
    useState<number>(0);

  const updateCharacterCount = useCallback(
    debounce(
      (count: number) =>
        setCharacterLimitAnnoucement(props.characterLimit || 0 - count),
      750,
    ),
    [],
  );

  useEffect(() => {
    updateCharacterCount(props.characterCount);
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
      >
        {`You can enter up to ${props.characterLimit} characters`}
      </Typography>
      <Typography
        paddingTop={0.5}
        paddingLeft={props.error ? 2 : 0}
        variant="body2"
        color={characterLimitBool ? "InfoText" : "error"}
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
      >{`You have ${characterLimitAnnoucement} characters remaining`}</Typography>
    </>
  );
};
