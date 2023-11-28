import Box, { BoxProps } from "@mui/material/Box";
import ButtonBase, { ButtonBaseProps } from "@mui/material/ButtonBase";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { useState } from "react";
import { ChromePicker } from "react-color";

export interface Props {
  label?: string;
  inline?: boolean;
  color?: string;
  onChange?: (newColor: string) => void;
}

interface RootProps extends BoxProps {
  inline?: boolean;
}

const Root = styled(Box, {
  shouldForwardProp: (prop) => prop !== "inline",
})<RootProps>(({ inline, theme }) => ({
  padding: 0,
  position: "relative",
  display: "flex",
  alignItems: "center",
  ...(inline && {
    padding: theme.spacing(2, 0),
    "& .popover": {
      top: "calc(100% - 4px)",
    },
  }),
}));

const Swatch = styled(Box)(({ theme }) => ({
  background: "#fff",
  display: "inline-block",
  cursor: "pointer",
  marginRight: theme.spacing(1),
  width: 24,
  height: 24,
  border: `2px solid ${theme.palette.border.input}`,
}));

const Cover = styled(ButtonBase)(() => ({
  position: "fixed",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  width: "100%",
}));

const Popover = styled(Box)(() => ({
  position: "absolute",
  zIndex: 2,
  top: "calc(100% + 12px)",
}));

const StyledButtonBase = styled(ButtonBase, {
  shouldForwardProp: (prop) => prop !== "show",
})<ButtonBaseProps & { show: boolean }>(({ theme, show }) => ({
  fontFamily: "inherit",
  fontSize: 15,
  position: "relative",
  display: "flex",
  alignItems: "center",
  textAlign: "left",
  padding: theme.spacing(1),
  whiteSpace: "nowrap",
  backgroundColor: theme.palette.common.white,
  border: `1px solid ${theme.palette.border.light}`,
  ...(show && {
    color: theme.palette.primary.dark,
    "& .swatch": {
      boxShadow: `inset 0 0 0 2px ${theme.palette.primary.light}`,
    },
  }),
}));

export default function ColorPicker(props: Props): FCReturn {
  const [show, setShow] = useState(false);

  const handleClick = () => {
    setShow((prevShow) => !prevShow);
  };

  const handleClose = () => {
    setShow(false);
  };

  const handleChange = (newColor: any) => {
    props.onChange && props.onChange(newColor.hex);
  };

  return (
    <Root inline={props.inline}>
      <Typography mr={2} variant="body2" component="label">
        {props.label || "Background colour"}:{" "}
      </Typography>
      <StyledButtonBase show={show} onClick={handleClick} disableRipple>
        <Swatch sx={{ backgroundColor: props.color }} className="swatch" />
        {props.color}
      </StyledButtonBase>
      {show ? (
        <Popover className="popover">
          <Cover
            onClick={handleClose}
            aria-label="Close Colour Picker"
            disableRipple
          />
          <ChromePicker
            color={props.color}
            disableAlpha={true}
            onChange={handleChange}
          />
        </Popover>
      ) : null}
    </Root>
  );
}
