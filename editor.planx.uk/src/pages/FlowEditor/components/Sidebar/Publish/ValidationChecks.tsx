import Cancel from "@mui/icons-material/Cancel";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Close from "@mui/icons-material/Close";
import Done from "@mui/icons-material/Done";
import NotInterested from "@mui/icons-material/NotInterested";
import WarningAmber from "@mui/icons-material/WarningAmber";
import Accordion, { accordionClasses } from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import countBy from "lodash/countBy";
import React from "react";
import { useState } from "react";
import Caret from "ui/icons/Caret";

export interface ValidationCheck {
  title: string;
  status: "Pass" | "Fail" | "Warn" | "Not applicable";
  message: string;
}

export const PublishModalAccordion = styled(Accordion)(({ theme }) => ({
  width: "100%",
  backgroundColor: "transparent",
  position: "relative",
  margin: "0",
  borderBottom: `1px solid ${theme.palette.border.main}`,
  [`&.${accordionClasses.root}.Mui-expanded`]: {
    margin: "0",
  },
  "&:hover": {
    background: theme.palette.background.paper,
  },
}));

export const PublishModalAccordionSummary = styled(AccordionSummary)(
  ({ theme }) => ({
    padding: "0",
    margin: "0",
    minHeight: "0",
    "& > div": {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
      transition: "none",
    },
    "& svg": {
      color: theme.palette.text.primary,
    },
  }),
);

export const ValidationChecks = (props: {
  validationChecks: ValidationCheck[];
}) => {
  const { validationChecks } = props;
  const [expanded, setExpanded] = useState(false);

  const Icon: Record<ValidationCheck["status"], React.ReactElement> = {
    Pass: <Done color="success" />,
    Fail: <Close color="error" />,
    Warn: <WarningAmber color="warning" />,
    "Not applicable": <NotInterested color="disabled" />,
  };

  return (
    <Box pb={2}>
      <ValidationSummary validationChecks={validationChecks} />
      <PublishModalAccordion
        expanded={expanded}
        onChange={() => setExpanded(!expanded)}
      >
        <PublishModalAccordionSummary expandIcon={<Caret />}>
          <Typography>
            {expanded ? "Hide validation checks" : "Show validation checks"}
          </Typography>
        </PublishModalAccordionSummary>
        <AccordionDetails sx={{ padding: 0 }}>
          <List sx={{ margin: 0, padding: 0 }}>
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
                        check.status === "Not applicable"
                          ? "text.disabled"
                          : "inherit"
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
                        check.status === "Not applicable"
                          ? "text.disabled"
                          : "inherit"
                      }
                    >
                      {check.message}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </PublishModalAccordion>
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

  const formattedSummary = atLeastOneFail
    ? summary.join(", ")
    : summary.join(", ").concat(", 0 errors");

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        backgroundColor: "background.default",
        p: 1.5,
        border: 1,
        borderColor: "border.light",
      }}
    >
      {atLeastOneFail ? (
        <Cancel color="error" fontSize="large" />
      ) : (
        <CheckCircle color="success" fontSize="large" />
      )}
      <Typography
        variant="body1"
        component="div"
        sx={{ display: "flex", flexDirection: "column" }}
        gutterBottom
      >
        {atLeastOneFail ? `Fix errors before testing` : `Ready to test`}
        <Typography variant="caption">{formattedSummary}</Typography>
      </Typography>
    </Box>
  );
};
