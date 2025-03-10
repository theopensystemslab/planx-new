import Cancel from "@mui/icons-material/Cancel";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Close from "@mui/icons-material/Close";
import Done from "@mui/icons-material/Done";
import Help from "@mui/icons-material/Help";
import NotInterested from "@mui/icons-material/NotInterested";
import WarningAmber from "@mui/icons-material/WarningAmber";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { styled } from "@mui/material/styles";
import Tooltip, { tooltipClasses, TooltipProps } from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import countBy from "lodash/countBy";
import React from "react";

const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.primary,
    boxShadow: theme.shadows[1],
    fontSize: 11,
    fontWeight: theme.typography.fontWeightRegular,
    borderRadius: 4,
  },
}));

export interface ValidationCheck {
  title: string;
  status: "Pass" | "Fail" | "Warn" | "Not applicable";
  message: string;
}

export const ValidationChecks = (props: {
  validationChecks: ValidationCheck[];
}) => {
  const { validationChecks } = props;

  const Icon: Record<ValidationCheck["status"], React.ReactElement> = {
    Pass: <Done color="success" />,
    Fail: <Close color="error" />,
    Warn: <WarningAmber color="warning" />,
    "Not applicable": <NotInterested color="disabled" />,
  };

  return (
    <Box pb={2}>
      <Typography
        variant="h4"
        component="h3"
        gutterBottom
        sx={{ display: "flex", alignItems: "center" }}
      >
        Validation checks
        <LightTooltip
          title="Validation checks are automatic tests that scan your service and highlight when content changes introduce an error, like incorrectly using a component type or breaking an integration."
          placement="right"
          arrow={false}
        >
          <IconButton>
            <Help color="primary" />
          </IconButton>
        </LightTooltip>
      </Typography>
      <ValidationSummary validationChecks={validationChecks} />
      <List>
        {validationChecks.map((check, i) => (
          <ListItem
            key={i}
            dense
            sx={{
              backgroundColor: (theme) => theme.palette.background.default,
              border: (theme) => `1px solid ${theme.palette.border.light}`,
              marginTop: "-1px", // eliminate double borders
            }}
          >
            <ListItemIcon sx={{ minWidth: (theme) => theme.spacing(4) }}>
              {Icon[check.status]}
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography
                  variant="body2"
                  color={
                    check.status === "Not applicable" ? "GrayText" : "inherit"
                  }
                >
                  {check.title}
                </Typography>
              }
              secondary={
                <Typography
                  variant="body2"
                  fontSize="small"
                  color={
                    check.status === "Not applicable" ? "GrayText" : "inherit"
                  }
                >
                  {check.message}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

const ValidationSummary = (props: { validationChecks: ValidationCheck[] }) => {
  const { validationChecks } = props;
  const atLeastOneFail =
    validationChecks.filter((check) => check.status === "Fail").length > 0;
  const countByStatus = countBy(validationChecks, "status");

  const summary: string[] = [];
  Object.entries(countByStatus).map(([status, count]) => {
    switch (status) {
      case "Fail":
        summary.push(`${count} failing`);
        break;
      case "Warn":
        summary.push(count === 1 ? `${count} warning` : `${count} warnings`);
        break;
      case "Pass":
        summary.push(`${count} successful`);
        break;
      case "Not applicable":
        summary.push(`${count} skipped`);
        break;
    }
  });

  // If there aren't any fails, still add "0 errors" to end of summary string for distinction from "warnings"
  const formattedSummary = atLeastOneFail
    ? summary.join(", ")
    : summary.join(", ").concat(", 0 errors");

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      {atLeastOneFail ? (
        <Cancel
          color="error"
          fontSize="large"
          sx={{ minWidth: (theme) => theme.spacing(5.5) }}
        />
      ) : (
        <CheckCircle
          color="success"
          fontSize="large"
          sx={{ minWidth: (theme) => theme.spacing(5.5) }}
        />
      )}
      <Typography
        variant="body1"
        component="div"
        sx={{ display: "flex", flexDirection: "column" }}
        gutterBottom
      >
        {atLeastOneFail ? `Fix errors before publishing` : `Ready to publish`}
        <Typography variant="caption">{formattedSummary}</Typography>
      </Typography>
    </Box>
  );
};
