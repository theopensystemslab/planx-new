import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { lighten, styled, Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import visuallyHidden from "@mui/utils/visuallyHidden";
import type { PublicProps } from "@planx/components/ui";
import { hasFeatureFlag } from "lib/featureFlags";
import { useStore } from "pages/FlowEditor/lib/store";
import {
  SectionNode,
  SectionStatus,
} from "pages/FlowEditor/lib/store/navigation";
import React, { useEffect } from "react";

import Card from "../shared/Preview/Card";
import QuestionHeader from "../shared/Preview/QuestionHeader";
import type { Section } from "./model";

export type Props = PublicProps<Section>;

export default function Component(props: Props) {
  const showSection = hasFeatureFlag("NAVIGATION_UI");
  const [
    flow,
    flowName,
    currentSectionIndex,
    sectionCount,
    sectionNodes,
    sectionStatuses,
    currentCard,
    changeAnswer,
  ] = useStore((state) => [
    state.flow,
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

  const changeFirstAnswerInSection = (sectionId: string) => {
    const sectionIndex = flow._root.edges?.indexOf(sectionId);
    if (sectionIndex !== undefined) {
      const firstNodeInSection = flow._root.edges?.[sectionIndex + 1];
      if (firstNodeInSection) changeAnswer(firstNodeInSection);
    }
  };

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
      <SectionsOverviewList
        sectionNodes={sectionNodes}
        sectionStatuses={sectionStatuses}
        showChange={true}
        changeFirstAnswerInSection={changeFirstAnswerInSection}
      />
    </Card>
  );
}

interface SectionsOverviewListProps {
  sectionNodes: Record<string, SectionNode>;
  sectionStatuses: Record<string, SectionStatus>;
  showChange: boolean;
  changeFirstAnswerInSection?: (sectionId: string) => void;
}

export function SectionsOverviewList(props: SectionsOverviewListProps) {
  const {
    sectionNodes,
    sectionStatuses,
    showChange,
    changeFirstAnswerInSection,
  } = props;

  return (
    <DescriptionList>
      {Object.entries(sectionNodes).map(([sectionId, sectionNode]) => (
        <React.Fragment key={sectionId}>
          <dt>
            {showChange &&
            sectionStatuses[sectionId] === SectionStatus.Completed ? (
              <Link
                onClick={() =>
                  changeFirstAnswerInSection &&
                  changeFirstAnswerInSection(sectionId)
                }
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
  );
}

const getTagBackgroundColor = (theme: Theme, title: string): string => {
  const backgroundColors: Record<string, string> = {
    [SectionStatus.NeedsUpdated]: theme.palette.action.focus, // GOV UK YELLOW for now, check Figma
    [SectionStatus.ReadyToContinue]: lighten(theme.palette.primary.main, 0.9),
    [SectionStatus.ReadyToStart]: lighten(theme.palette.primary.main, 0.9),
    [SectionStatus.Started]: lighten(theme.palette.primary.main, 0.8),
    [SectionStatus.NotStarted]: theme.palette.grey[200],
    [SectionStatus.Completed]: theme.palette.success.main,
  };

  return backgroundColors[title];
};

const getTagTextColor = (theme: Theme, title: string): string => {
  const textColors: Record<string, string> = {
    [SectionStatus.NeedsUpdated]: "#000",
    [SectionStatus.ReadyToContinue]: "#000",
    [SectionStatus.ReadyToStart]: "#000",
    [SectionStatus.Started]: theme.palette.primary.main,
    [SectionStatus.NotStarted]: theme.palette.getContrastText(
      theme.palette.grey[200]
    ),
    [SectionStatus.Completed]: "#FFF",
  };

  return textColors[title];
};

const Tag = styled("div", {
  // Configure which props should be forwarded on DOM
  shouldForwardProp: (prop) => prop !== "title",
})(({ title, theme }) => ({
  backgroundColor: title ? getTagBackgroundColor(theme, title) : undefined,
  color: title ? getTagTextColor(theme, title) : undefined,
  fontWeight: 600,
  paddingTop: theme.spacing(0.5),
  paddingBottom: theme.spacing(0.5),
  paddingLeft: theme.spacing(1.5),
  paddingRight: theme.spacing(1.5),
}));

const Grid = styled("dl")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr 200px",
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
