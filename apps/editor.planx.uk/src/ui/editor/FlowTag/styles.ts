import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

import { FlowTagProps, FlowTagType, StatusVariant } from "./types";

export const Root = styled(Box, {
  shouldForwardProp: (prop) => prop !== "tagType" && prop !== "statusVariant",
})<FlowTagProps>(({ theme, tagType, statusVariant }) => ({
  fontSize: theme.typography.body2.fontSize,
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
  color: theme.palette.common.black,
  padding: "2px 8px",
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
  borderRadius: "50px",
  textTransform: "capitalize",
  border: "1px solid rgba(0, 0, 0, 0.2)",
  ...(tagType === FlowTagType.Status && {
    backgroundColor:
      statusVariant === StatusVariant.Online
        ? theme.palette.flowTag.online
        : theme.palette.flowTag.offline,
    "&::before": {
      content: '""',
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      background:
        statusVariant === StatusVariant.Online
          ? theme.palette.success.main
          : theme.palette.action.disabled,
    },
  }),
  ...(tagType === FlowTagType.ApplicationType && {
    backgroundColor: theme.palette.flowTag.applicationType,
  }),
  ...(tagType === FlowTagType.ServiceType && {
    backgroundColor: theme.palette.flowTag.serviceType,
  }),
}));
