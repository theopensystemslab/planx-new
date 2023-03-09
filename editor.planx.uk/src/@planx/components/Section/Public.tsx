import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { styled, Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import visuallyHidden from "@mui/utils/visuallyHidden";
import type { PublicProps } from "@planx/components/ui";
import { hasFeatureFlag } from "lib/featureFlags";
import { useStore } from "pages/FlowEditor/lib/store";
import { SectionStatus } from "pages/FlowEditor/lib/store/navigation";
import React, { useEffect } from "react";

import Card from "../shared/Preview/Card";
import QuestionHeader from "../shared/Preview/QuestionHeader";
import type { Section } from "./model";

export type Props = PublicProps<Section>;

export default function Component(props: Props) {
  const showSection = hasFeatureFlag("NAVIGATION_UI");
  const [
    flowName,
    currentSectionIndex,
    sectionCount,
    sectionNodes,
    sectionStatuses,
    currentCard,
    changeAnswer,
  ] = useStore((state) => [
    state.flowName,
    state.currentSectionIndex,
    state.sectionCount,
    state.sectionNodes,
    state.sectionStatuses(),
    state.currentCard(),
    state.changeAnswer,
  ]);

  useEffect(() => {
    // if the feature flag is toggled off, hide this node (by auto-answering it) when navigating through a flow
    !showSection &&
      props.handleSubmit?.({
        auto: true,
      });
  }, []);

  return !showSection ? null : (
    <Card isValid handleSubmit={props.handleSubmit}>
      <QuestionHeader title={flowName} />
      <Box sx={{ lineHeight: ".5em" }}>
        <Typography variant="body1" component="h2" sx={{ fontWeight: "bold" }}>
          Application incomplete.
        </Typography>
        <Typography variant="body2">
          {`You have completed ${
            Object.keys(sectionNodes)[0] === currentCard?.id
              ? 0
              : currentSectionIndex
          } of ${sectionCount} sections`}
        </Typography>
      </Box>
      <DescriptionList>
        {Object.entries(sectionNodes).map(([sectionId, sectionNode]) => (
          <React.Fragment key={sectionId}>
            <dt>
              {sectionStatuses[sectionId] === SectionStatus.Completed ? (
                <Link
                  onClick={() => changeAnswer(sectionId)}
                  component="button"
                  sx={{ fontFamily: "inherit", fontSize: "inherit" }}
                >
                  {sectionNode.data.title}
                  <span style={visuallyHidden}>
                    {`Change ${sectionNode.data.title}`}
                  </span>
                </Link>
              ) : (
                sectionNode.data.title
              )}
            </dt>
            <dd>
              <Tag title={sectionStatuses[sectionId]}>
                {sectionStatuses[sectionId]}
              </Tag>
            </dd>
          </React.Fragment>
        ))}
      </DescriptionList>
    </Card>
  );
}

const getTagBackgroundColor = (theme: Theme, title: string): string => {
  const backgroundColors: Record<string, string> = {
    [SectionStatus.NotStarted]: "#F3F2F1",
    [SectionStatus.InProgress]: theme.palette.primary.main,
    [SectionStatus.Completed]: "#00703C",
  };

  return backgroundColors[title];
};

const getTagTextColor = (theme: Theme, title: string): string => {
  const textColors: Record<string, string> = {
    [SectionStatus.NotStarted]: "#505A5F",
    [SectionStatus.InProgress]: theme.palette.primary.contrastText,
    [SectionStatus.Completed]: "#FFFFFF",
  };

  return textColors[title];
};

const Tag = styled("div", {
  // Configure which props should be forwarded on DOM
  shouldForwardProp: (prop) => prop !== "title",
})(({ title, theme }) => ({
  backgroundColor: title
    ? getTagBackgroundColor(theme, title)
    : theme.palette.grey[300],
  color: title ? getTagTextColor(theme, title) : theme.palette.text.primary,
  fontWeight: 600,
  paddingTop: theme.spacing(0.5),
  paddingBottom: theme.spacing(0.5),
  paddingLeft: theme.spacing(1.5),
  paddingRight: theme.spacing(1.5),
}));

const Grid = styled("dl")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr 175px",
  gridRowGap: "5px",
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  "& > *": {
    borderBottom: "1px solid grey",
    paddingBottom: theme.spacing(2),
    paddingTop: theme.spacing(2),
    verticalAlign: "top",
    margin: 0,
  },
  "& ul": {
    listStylePosition: "inside",
    padding: 0,
    margin: 0,
  },
  "& dt": {
    // left column
    fontWeight: 500,
  },
  "& dd:nth-of-type(1n)": {
    // right column
    textAlign: "center",
  },
}));

interface DescriptionListProps {
  children: React.ReactNode;
}

const DescriptionList: React.FC<DescriptionListProps> = ({ children }) => {
  return <Grid>{children}</Grid>;
};
