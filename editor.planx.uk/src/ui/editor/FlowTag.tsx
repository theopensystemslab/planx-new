import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

export enum FlowTagType {
  Status = "status",
  ApplicationType = "applicationType",
  ServiceType = "serviceType",
}

export enum StatusVariant {
  Online = "online",
  Offline = "offline",
}

const BG_ONLINE = "#D6FFD7";
const BG_OFFLINE = "#EAEAEA";
const BG_APPLICATION_TYPE = "#D6EFFF";
const BG_SERVICE_TYPE = "#FFEABE";

const Root = styled(Box, {
  shouldForwardProp: (prop) => prop !== "tagType" && prop !== "statusVariant",
})<Props>(({ theme, tagType, statusVariant }) => ({
  fontSize: theme.typography.body2.fontSize,
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
  padding: "2px 6px",
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
  borderRadius: "4px",
  textTransform: "capitalize",
  border: "1px solid rgba(0, 0, 0, 0.2)",
  ...(tagType === FlowTagType.Status && {
    backgroundColor:
      statusVariant === StatusVariant.Online ? BG_ONLINE : BG_OFFLINE,
    "&::before": {
      content: '""',
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      background:
        statusVariant === StatusVariant.Online
          ? theme.palette.success.main
          : "#a1a1a1",
    },
  }),
  ...(tagType === FlowTagType.ApplicationType && {
    backgroundColor: BG_APPLICATION_TYPE,
  }),
  ...(tagType === FlowTagType.ServiceType && {
    backgroundColor: BG_SERVICE_TYPE,
  }),
}));

export interface Props {
  id?: string;
  tagType: FlowTagType;
  statusVariant?: StatusVariant;
  children?: React.ReactNode;
}

const FlowTag: React.FC<Props> = ({ id, tagType, statusVariant, children }) => (
  <Root id={id} tagType={tagType} statusVariant={statusVariant}>
    {children}
  </Root>
);

export default FlowTag;
