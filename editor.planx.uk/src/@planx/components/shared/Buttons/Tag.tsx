import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
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

const Root = styled(Box, {
  shouldForwardProp: (prop) => prop !== "tagType",
})<Props>(({ theme, tagType }) => ({
  fontSize: theme.typography.body2.fontSize,
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
  width: "auto",
  paddingTop: theme.spacing(0.75),
  paddingBottom: theme.spacing(0.75),
  paddingLeft: theme.spacing(1.25),
  paddingRight: theme.spacing(1.25),
  display: "inline-block",
  textAlign: "center",
  ...(tagType === TagType.Alert && {
    color: theme.palette.text.primary,
    backgroundColor: BG_ALERT,
  }),
  ...(tagType === TagType.Active && {
    backgroundColor: BG_ACTIVE,
    color: theme.palette.success.dark,
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
  children?: React.ReactNode;
}

export default function Tag(props: Props): FCReturn {
  const { id, tagType, children } = props;

  return (
    <Root id={id} tagType={tagType} component="span">
      {children}
    </Root>
  );
}
