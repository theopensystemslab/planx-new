import Typography from "@mui/material/Typography";
import React, { Fragment } from "react";
import { FONT_WEIGHT_BOLD } from "theme";

interface Props {
  text: string;
  matchIndices: [number, number][];
  variant?: "data";
}

export const Headline: React.FC<Props> = ({ text, matchIndices, variant }) => {
  const isHighlighted = (index: number) =>
    matchIndices.some(([start, end]) => index >= start && index <= end);

  return (
    <>
      {text.split("").map((char, index) => (
        <Fragment key={`headline-character-${index}`}>
          <Typography
            component="span"
            variant={variant || "body2"}
            sx={(theme) => ({
              fontWeight: isHighlighted(index) ? FONT_WEIGHT_BOLD : "regular",
              fontSize: theme.typography.body2.fontSize,
            })}
          >
            {char}
          </Typography>
          {/* Add wordbreak after special characters */}
          {char.match(/\W/) && <wbr />}
        </Fragment>
      ))}
    </>
  );
};
