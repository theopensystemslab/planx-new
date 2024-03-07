import Box from "@mui/material/Box";
import MuiButtonBase, { ButtonBaseProps } from "@mui/material/ButtonBase";
import { darken, styled } from "@mui/material/styles";
import { visuallyHidden } from "@mui/utils";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

export enum TagType {
  Alert = "alert",
  Active = "active",
  Notice = "notice",
  Success = "success",
}

const BG_ALERT = "#FAFF00";
const BG_ACTIVE = "#E5F1EB";
const BG_NOTICE = "#F3F2F1";

const Root = styled(MuiButtonBase, {
  shouldForwardProp: (prop) => prop !== "tagType",
})<ButtonBaseProps & Props>(({ theme, tagType }) => ({
  fontSize: theme.typography.body2.fontSize,
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
  width: "100%",
  paddingTop: theme.spacing(0.75),
  paddingBottom: theme.spacing(0.75),
  paddingLeft: theme.spacing(1.25),
  paddingRight: theme.spacing(1.25),
  ...(tagType === TagType.Alert && {
    color: theme.palette.text.primary,
    backgroundColor: BG_ALERT,
    "&:hover": {
      backgroundColor: darken(BG_ALERT, 0.05),
    },
  }),
  ...(tagType === TagType.Active && {
    backgroundColor: BG_ACTIVE,
    color: theme.palette.success.dark,
    "&:hover": {
      backgroundColor: darken(BG_ACTIVE, 0.05),
    },
  }),
  ...(tagType === TagType.Notice && {
    backgroundColor: BG_NOTICE,
    color: theme.palette.text.secondary,
  }),
  ...(tagType === TagType.Success && {
    backgroundColor: theme.palette.success.dark,
    color: "#FFFFFF",
  }),
}));

export interface Props {
  id?: string;
  tagType: TagType;
  onClick: (event?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  children?: React.ReactNode;
}

export default function Tag(props: Props): FCReturn {
  const { id, tagType, onClick, children } = props;

  return (
    <Root
      disabled={tagType == TagType.Notice || tagType == TagType.Success}
      onClick={onClick}
      id={id}
      tagType={tagType}
    >
      <Box sx={visuallyHidden} component="span">The status of this section of the application is:</Box>
      {children}
    </Root>
  );
}
