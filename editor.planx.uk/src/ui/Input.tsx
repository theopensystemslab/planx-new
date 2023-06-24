import InputBase, { InputBaseProps } from "@mui/material/InputBase";
import { styled } from "@mui/material/styles";
import React, {
  ChangeEvent,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import { borderedFocusStyle, FONT_WEIGHT_SEMI_BOLD } from "theme";

import ErrorWrapper from "./ErrorWrapper";

const PREFIX = "Input";

const classes = {
  multiline: `${PREFIX}-multiline`,
  adornedEnd: `${PREFIX}-adornedEnd`,
  focused: `${PREFIX}-focused`,
};

export interface Props extends InputBaseProps {
  format?: "large" | "bold" | "data";
  classes?: any;
  className?: string;
  grow?: boolean;
  large?: boolean;
  bordered?: boolean;
  errorMessage?: string;
  onChange?: (ev: ChangeEvent<HTMLInputElement>) => void;
}

interface StyledInputBase extends InputBaseProps {
  format?: Props["format"];
  bordered?: Props["bordered"];
}

const StyledInputBase = styled(InputBase, {
  shouldForwardProp: (prop) =>
    !["format", "bordered"].includes(prop.toString()),
})<StyledInputBase>(({ theme, format, bordered }) => ({
  backgroundColor: "#fff",
  // Maintain 16px minimum input size to prevent zoom on iOS
  fontSize: "1rem",
  width: "100%",
  padding: theme.spacing(0, 1.5),
  height: 50,
  "& input": {
    fontWeight: "inherit",
  },
  ...(bordered && {
    border: `2px solid ${theme.palette.text.primary}`,
  }),
  ...(format === "data" && {
    backgroundColor: "#fafafa",
  }),
  ...(format === "bold" && {
    fontWeight: FONT_WEIGHT_SEMI_BOLD,
  }),
  ...(format === "large" && {
    backgroundColor: "#fff",
    height: 50,
    fontSize: 25,
    width: "100%",
    fontWeight: FONT_WEIGHT_SEMI_BOLD,
  }),
  [`& .${classes.multiline}`]: {
    height: "auto",
    "& textarea": {
      padding: theme.spacing(1.5, 0),
      lineHeight: 1.6,
    },
  },
  [`& .${classes.adornedEnd}`]: {
    paddingRight: 2,
  },
  [`& .${classes.focused}`]: {
    ...(bordered && borderedFocusStyle),
  },
}));

export default forwardRef((props: Props, ref): FCReturn => {
  const container = useRef<HTMLDivElement | null>(null);

  const {
    format,
    bordered,
    errorMessage,
    "aria-label": ariaLabel,
    "aria-describedby": ariaDescribedBy,
    id,
    ...restProps
  } = props;

  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        container.current?.querySelector("input")?.focus();
      },
      select: () => {
        container.current?.querySelector("input")?.select();
      },
    }),
    []
  );

  return (
    <ErrorWrapper error={errorMessage} id={id}>
      <StyledInputBase
        format={format}
        bordered={bordered}
        classes={classes}
        inputProps={{
          "aria-label": ariaLabel,
          "aria-describedby": ariaDescribedBy,
        }}
        id={id}
        ref={container}
        {...restProps}
      />
    </ErrorWrapper>
  );
});
