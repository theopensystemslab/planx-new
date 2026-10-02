import type { SelectProps } from "@mui/material/Select";
import Select, { selectClasses } from "@mui/material/Select";
import { styled } from "@mui/material/styles";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import { visuallyHidden } from "@mui/utils";
import { IconChevronDownFilled } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { Icon } from "ui/icons/Icon";

import Input from "../../shared/Input/Input";

export type Props = SelectProps & {
  name?: string;
  children?: ReactNode;
  onChange?: SelectProps["onChange"];
  bordered?: boolean;
  visuallyHiddenLabel?: boolean;
  size?: "small" | "default";
};

const PREFIX = "SelectInput";

const classes = {
  rootSelect: `${PREFIX}-rootSelect`,
  icon: `${PREFIX}-icon`,
  menuPaper: `${PREFIX}-menuPaper`,
  inputSelect: `${PREFIX}-inputSelect`,
};

const Root = styled(Select)<{ size?: "small" | "default" }>(
  ({ theme, size }) => ({
    width: "100%",
    padding: 0,
    height: size === "small" ? 40 : "unset",
    minWidth: "175px",
    [`& .${selectClasses.select}`]: {
      width: "100%",
      padding: size === "small" ? theme.spacing(1) : theme.spacing(1, 1.5),
    },
    // Match caret in MultipleSelect component
    [`& .${classes.icon}`]: {
      padding: size === "small" ? theme.spacing(0.25) : theme.spacing(0.5),
      color: theme.palette.primary.main,
      fontSize: size === "small" ? "2rem" : "2.5rem",
    },
  }),
);

const ArrowIcon = (props: SvgIconProps) => (
  <Icon icon={IconChevronDownFilled} {...props} />
);

export default function SelectInput({
  children,
  value,
  name,
  onChange,
  bordered,
  visuallyHiddenLabel,
  size,
  ...props
}: Props): FCReturn {
  return (
    <>
      {visuallyHiddenLabel && (
        <label
          id={`${name?.replaceAll(" ", "-")}-label`}
          style={visuallyHidden}
        >
          {name}
        </label>
      )}
      <Root
        variant="standard"
        size={size}
        value={value}
        {...(name && { labelId: `${name.replaceAll(" ", "-")}-label` })}
        classes={{
          select: classes.rootSelect,
          icon: classes.icon,
        }}
        onChange={onChange}
        IconComponent={ArrowIcon}
        input={<Input bordered={bordered} />}
        inputProps={{
          name,
          classes: {
            input: classes.inputSelect,
          },
        }}
        MenuProps={{
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "center",
          },
          classes: {
            paper: classes.menuPaper,
          },
        }}
        {...props}
      >
        {children}
      </Root>
    </>
  );
}
