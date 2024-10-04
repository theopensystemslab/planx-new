import InputBase, {
  InputBaseClasses,
  InputBaseProps,
} from "@mui/material/InputBase";
import { styled } from "@mui/material/styles";
import {
  extraLongTextLimit,
  longTextLimit,
} from "@planx/components/TextInput/model";
import React, {
  ChangeEvent,
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  borderedFocusStyle,
  FONT_WEIGHT_SEMI_BOLD,
  inputFocusStyle,
} from "theme";

import { CharacterCounter } from "./CharacterCounter";
import ErrorWrapper from "./ErrorWrapper";

const PREFIX = "Input";

const classes: Partial<InputBaseClasses> = {
  multiline: `${PREFIX}-multiline`,
  focused: `${PREFIX}-focused`,
};

export interface Props extends InputBaseProps {
  format?: "large" | "bold" | "data";
  classes?: InputBaseClasses;
  className?: string;
  grow?: boolean;
  large?: boolean;
  bordered?: boolean;
  errorMessage?: string;
  textLength?: string;
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
  backgroundColor: theme.palette.common.white,
  // Maintain 16px minimum input size to prevent zoom on iOS
  fontSize: "1rem",
  width: "100%",
  padding: theme.spacing(0, 1.5),
  height: 50,
  border: `1px solid ${theme.palette.border.light}`,
  "& input": {
    fontWeight: "inherit",
  },
  "& input::placeholder, & textarea::placeholder": {
    color: theme.palette.text.placeholder,
    opacity: 1,
  },
  ...(bordered && {
    border: `2px solid ${theme.palette.text.primary}`,
  }),
  ...(format === "data" && {
    backgroundColor: "#f0f0f0",
    borderColor: "#d3d3d3",
    fontFamily: theme.typography.data.fontFamily,
    "& input": {
      fontSize: theme.typography.body2.fontSize,
    },
  }),
  ...(format === "bold" && {
    fontWeight: FONT_WEIGHT_SEMI_BOLD,
  }),
  ...(format === "large" && {
    backgroundColor: theme.palette.common.white,
    height: 50,
    width: "100%",
    fontWeight: FONT_WEIGHT_SEMI_BOLD,
  }),
  [`&.${classes.multiline}`]: {
    height: "auto",
    "& textarea": {
      padding: theme.spacing(1.5, 0),
      lineHeight: 1.6,
    },
  },
  [`&.${classes.focused}`]: {
    ...inputFocusStyle,
    ...(bordered && borderedFocusStyle),
  },
}));

export default forwardRef((props: Props, ref): FCReturn => {
  const container = useRef<HTMLDivElement | null>(null);
  const [characterLimit, setCharacterLimit] = useState<number>(0);

  const {
    format,
    bordered,
    errorMessage,
    "aria-label": ariaLabel,
    "aria-describedby": ariaDescribedBy,
    "aria-labelledby": ariaLabelledBy,
    id,
    textLength,
    ...restProps
  } = props;

  // set which character limit from user defined type
  if (characterLimit === 0) {
    switch (textLength) {
      case "long":
        setCharacterLimit(longTextLimit);
        break;
      case "extraLong":
        setCharacterLimit(extraLongTextLimit);
        break;
    }
  }

  const showCharacterCountBool =
    props.type === "text" &&
    (textLength === "long" || textLength === "extraLong");

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
    [],
  );

  return (
    <ErrorWrapper error={errorMessage} id={id}>
      <>
        <StyledInputBase
          format={format}
          bordered={bordered}
          classes={classes}
          inputProps={{
            "aria-label": ariaLabel,
            "aria-describedby": ariaDescribedBy,
            "aria-labelledby": ariaLabelledBy,
          }}
          id={id}
          ref={container}
          {...restProps}
        />
        {showCharacterCountBool && (
          <CharacterCounter
            characterCount={
              typeof props.value === "string" ? props.value.length : 0
            }
            characterLimit={characterLimit}
            error={errorMessage ? true : false}
          />
        )}
      </>
    </ErrorWrapper>
  );
});
