import Typography from "@mui/material/Typography";
import React from "react";
import { FONT_WEIGHT_BOLD } from "theme";

interface Props {
  text: string;
  matchIndices: [number, number][];
  variant: "data";
}

export const Headline: React.FC<Props> = ({ text, matchIndices }) => {
  const isHighlighted = (index: number) =>
    matchIndices.some(([start, end]) => index >= start && index <= end);

  return (
    <>
      {text.split("").map((char, index) => (
        <Typography
          component="span"
          variant="data"
          key={`headline-character-${index}`}
          sx={(theme) => ({
            fontWeight: isHighlighted(index) ? FONT_WEIGHT_BOLD : "regular",
            fontSize: theme.typography.body2.fontSize,
          })}
        >
          {char}
        </Typography>
      ))}
    </>
  );
};
