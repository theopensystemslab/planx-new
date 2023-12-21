import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { Meta } from "@storybook/react";
import React from "react";
import { defaultTheme } from "ui/editor/theme";

// The `PaletteOptions` exported by Material-UI are expressed as an interface,
// so this gets us a union type
type PaletteOption = keyof typeof defaultTheme.palette;

const metadata: Meta = {
  title: "Design System/Palette",
};

const ColorSwatch: React.FC<{ color: string; title: string }> = (props) => (
  <Grid item>
    <Box
      display="flex"
      flexDirection="column"
      flexShrink={1}
      alignItems="flex-start"
      marginX={0}
      marginY={1}
    >
      <Typography variant="caption">{props.title}</Typography>
      <Box
        height={100}
        width={150}
        bgcolor={props.color}
        border="1px solid #eee"
      ></Box>
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
      <Typography variant="h4" component="h5">
        {props.option}
      </Typography>
      <Grid container>
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
  const options = Object.keys(defaultTheme.palette) as PaletteOption[];
  return (
    <>
      {options.map((option, i) => (
        <ColorGrid option={option} key={i} />
      ))}
    </>
  );
};

export default metadata;
