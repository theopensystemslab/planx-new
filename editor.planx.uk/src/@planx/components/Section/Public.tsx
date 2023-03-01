import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import type { PublicProps } from "@planx/components/ui";
import { hasFeatureFlag } from "lib/featureFlags";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect } from "react";

import Card from "../shared/Preview/Card";
import QuestionHeader from "../shared/Preview/QuestionHeader";
import type { Section } from "./model";

export type Props = PublicProps<Section>;

enum SectionStatus {
  NotStarted = "CANNOT START YET",
  ReadyToStart = "READY TO START",
  Completed = "COMPLETED",
  NeedsUpdated = "NEEDS UPDATED", // future reconciliation scenario, not used yet
}

export default function Component(props: Props) {
  const showSection = hasFeatureFlag("NAVIGATION_UI");

  const [
    flowName,
    currentSectionIndex,
    sectionCount,
    sectionNodes,
    currentCard,
    upcomingCardIds,
  ] = useStore((state) => [
    state.flowName,
    state.currentSectionIndex,
    state.sectionCount,
    state.sectionNodes,
    state.currentCard(),
    state.upcomingCardIds(),
  ]);

  useEffect(() => {
    // if the feature flag is toggled off, hide this node (by auto-answering it) when navigating through a flow
    !showSection &&
      props.handleSubmit?.({
        auto: true,
      });
  }, []);

  const getStatus = (
    sectionId: string,
    currentCardId: string | undefined,
    upcomingCardIds: string[] | undefined
  ): SectionStatus => {
    if (currentCardId === sectionId) {
      return SectionStatus.ReadyToStart;
    } else if (upcomingCardIds?.includes(sectionId)) {
      return SectionStatus.NotStarted;
    } else {
      return SectionStatus.Completed;
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
      <DescriptionList>
        {Object.entries(sectionNodes).map(([sectionId, sectionNode]) => (
          <React.Fragment key={sectionId}>
            <dt>{sectionNode.data.title}</dt>
            <dd>
              <Tag>
                {getStatus(sectionId, currentCard?.id, upcomingCardIds)}
              </Tag>
            </dd>
          </React.Fragment>
        ))}
      </DescriptionList>
    </Card>
  );
}

const Tag = styled("div")(({ theme }) => ({
  backgroundColor: "lightgrey",
  paddingTop: theme.spacing(0.5),
  paddingBottom: theme.spacing(0.5),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
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
