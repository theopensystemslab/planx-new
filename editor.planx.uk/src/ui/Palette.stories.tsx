import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { Meta } from "@storybook/react/types-6-0";
import React from "react";

import theme from "../theme";

// The `PaletteOptions` exported by Material-UI are expressed as an interface,
// so this gets us a union type
type PaletteOption = keyof typeof theme.palette;

const metadata: Meta = {
  title: "Design System/Palette",
};

const ColorSwatch: React.FC<{ color: string; title: string }> = (props) => (
  <Grid item>
    <Box
      height={100}
      width={100}
      bgcolor={props.color}
      border="1px solid black"
      display="flex"
      alignItems="center"
      justifyContent="center"
      padding={1}
      margin={0}
      flexShrink={1}
    >
      <Typography variant="caption">{props.title}</Typography>
    </Box>
  </Grid>
);

const ColorGrid: React.FC<{ option: PaletteOption }> = (props) => {
  const theme = useTheme();

  const colors = (() => {
    switch (props.option) {
      case "divider":
        return [theme.palette[props.option]];
      case "mode":
        return [];
      default:
        return Object.keys(theme.palette[props.option]);
    }
  })();

  if (!colors.length) return null;

  return (
    <>
      <Typography variant="h5">{props.option}</Typography>
      <Grid container spacing={1}>
        {colors.map((color, i) => {
          return (
            !color.match(/opacity/i) && (
              <ColorSwatch
                color={color.match(/rgba/) ? color : `${props.option}.${color}`}
                title={color}
                key={i}
              />
            )
          );
        })}
      </Grid>
    </>
  );
};

export const Index = () => {
  const options = Object.keys(theme.palette) as PaletteOption[];
  return (
    <>
      {options.map((option, i) => (
        <ColorGrid option={option} key={i} />
      ))}
    </>
  );
};

export default metadata;
