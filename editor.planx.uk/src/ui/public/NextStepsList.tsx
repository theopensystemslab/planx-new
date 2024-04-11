import EastIcon from "@mui/icons-material/East";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Link from "@mui/material/Link";
import { styled, Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import type { Step as StyledListItem } from "@planx/components/NextSteps/model";
import { useAnalyticsTracking } from "pages/FlowEditor/lib/analytics/provider";
import { handleSubmit } from "pages/Preview/Node";
import React, { useState } from "react";

interface NextStepsListProps {
  steps: StyledListItem[];
  handleSubmit?: handleSubmit;
}

interface ListItemProps extends StyledListItem {
  handleSubmit?: handleSubmit;
  handleSelectingUrl?: (url: string) => void;
}

const Root = styled("ul")(({ theme }) => ({
  listStyle: "none",
  margin: theme.spacing(3, 0, 0, 0),
  padding: 0,
}));

const StyledListItem = styled("li")(({ theme }) => ({
  position: "relative",
  display: "flex",
  borderBottom: `1px solid ${theme.palette.border.main}`,
}));

const innerStyle = (theme: Theme) => ({
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(2, 0),
  textDecoration: "none",
  borderBottom: `1px solid theme.palette.text.secondary`,
  "&:hover > .arrowButton": {
    backgroundColor: theme.palette.prompt.dark,
  },
  "&:focus > .arrowButton": {
    backgroundColor: theme.palette.text.primary,
    color: theme.palette.common.white,
  },
});

const InnerLink = styled(Link)(({ theme }) => ({
  ...innerStyle(theme),
  // Manually set hover and focus behaviours as we are doing something outside of the usual button style
  "&:hover h2": {
    textDecorationThickness: "3px",
  },
  "&:focus h2": {
    textDecoration: "none",
  },
}));

const InnerButton = styled(ButtonBase)(({ theme }) => ({
  ...innerStyle(theme),
  textAlign: "left",
}));

const ArrowButton = styled("span")(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: theme.palette.prompt.main,
  color: theme.palette.prompt.contrastText,
  width: "50px",
  height: "50px",
  flexShrink: "0",
}));

function LinkStep(props: ListItemProps) {
  return (
    <InnerLink
      href={props.url}
      target="_blank"
      rel="noopener"
      onClick={() =>
        props.handleSelectingUrl &&
        props.url &&
        props.handleSelectingUrl(props.url)
      }
    >
      <Step {...props} />
    </InnerLink>
  );
}

const ContinueStep = (props: ListItemProps) => (
  <InnerButton onClick={() => props.handleSubmit && props.handleSubmit()}>
    <Step {...props} />
  </InnerButton>
);

const Step = ({ title, description, url }: ListItemProps) => (
  <>
    <Box pr={2}>
      <Typography
        variant="h3"
        component="h2"
        mb={0.75}
        sx={{
          textDecoration: url && "underline",
          textDecorationThickness: "1px",
        }}
      >
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Box>
    <ArrowButton className="arrowButton">
      <EastIcon />
    </ArrowButton>
  </>
);

function NextStepsList(props: NextStepsListProps) {
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const { trackEvent } = useAnalyticsTracking();

  const handleSelectingUrl = (newUrl: string) => {
    setSelectedUrls((prevSelectedUrls) => [...prevSelectedUrls, newUrl]);
    trackEvent({
      event: "nextStepsClick",
      metadata: { selectedUrls: [...selectedUrls, newUrl] },
    });
  };

  return (
    <Root>
      {props.steps?.map((step, i) => (
        <StyledListItem key={i}>
          {step.url ? (
            <LinkStep {...step} handleSelectingUrl={handleSelectingUrl} />
          ) : (
            <ContinueStep {...step} handleSubmit={props.handleSubmit} />
          )}
        </StyledListItem>
      ))}
    </Root>
  );
}

export default NextStepsList;
