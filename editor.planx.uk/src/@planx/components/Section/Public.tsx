import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import visuallyHidden from "@mui/utils/visuallyHidden";
import Tag, { TagType } from "@planx/components/shared/Buttons/Tag";
import type { PublicProps } from "@planx/components/ui";
import { Store, useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { SectionNode, SectionStatus } from "types";

import Card from "../shared/Preview/Card";
import QuestionHeader from "../shared/Preview/QuestionHeader";
import type { Section } from "./model";
import { computeSectionStatuses } from "./model";

export type Props = PublicProps<Section>;

export default function Component(props: Props) {
  const [
    flow,
    flowName,
    currentSectionIndex,
    sectionCount,
    sectionNodes,
    currentCard,
    changeAnswer,
    breadcrumbs,
    cachedBreadcrumbs,
  ] = useStore((state) => [
    state.flow,
    state.flowName,
    state.currentSectionIndex,
    state.sectionCount,
    state.sectionNodes,
    state.currentCard(),
    state.changeAnswer,
    state.breadcrumbs,
    state.cachedBreadcrumbs,
  ]);

  return (
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
        flow={flow}
        showChange={true}
        changeAnswer={changeAnswer}
        nextQuestion={() => props.handleSubmit && props.handleSubmit()}
        sectionNodes={sectionNodes}
        currentCard={currentCard}
        breadcrumbs={breadcrumbs}
        cachedBreadcrumbs={cachedBreadcrumbs}
      />
    </Card>
  );
}

type SectionsOverviewListProps = {
  flow: Store.flow;
  showChange: boolean;
  changeAnswer: (sectionId: string) => void;
  nextQuestion: () => void;
  sectionNodes: Record<string, SectionNode>;
  currentCard: Store.node | null;
  breadcrumbs: Store.breadcrumbs;
  cachedBreadcrumbs?: Store.cachedBreadcrumbs;
  isReconciliation?: boolean;
  alteredSectionIds?: string[];
};

export function SectionsOverviewList({
  flow,
  showChange,
  changeAnswer,
  nextQuestion,
  sectionNodes,
  currentCard,
  breadcrumbs,
  cachedBreadcrumbs,
  isReconciliation,
  alteredSectionIds,
}: SectionsOverviewListProps) {
  const sectionStatuses = computeSectionStatuses({
    sectionNodes,
    currentCard,
    breadcrumbs,
    cachedBreadcrumbs,
    isReconciliation,
    alteredSectionIds,
  });

  const changeFirstAnswerInSection = (sectionId: string) => {
    const sectionIndex = flow._root.edges?.indexOf(sectionId);
    if (sectionIndex !== undefined) {
      const firstNodeInSection = flow._root.edges?.[sectionIndex + 1];
      if (firstNodeInSection) changeAnswer(firstNodeInSection);
    }
  };

  const getTag = (section: SectionStatus) => {
    const tagTypes: Record<SectionStatus, TagType> = {
      [SectionStatus.NeedsUpdated]: TagType.Alert,
      [SectionStatus.ReadyToStart]: TagType.Active,
      [SectionStatus.ReadyToContinue]: TagType.Active,
      [SectionStatus.Started]: TagType.Notice,
      [SectionStatus.NotStarted]: TagType.Notice,
      [SectionStatus.Completed]: TagType.Success,
    };
    const type = tagTypes[section];

    const onClick =
      type == TagType.Alert || type == TagType.Active
        ? () => nextQuestion()
        : () => {}; // no-op

    return (
      <Tag type={type} onClick={onClick}>
        {section}
      </Tag>
    );
  };

  return (
    <DescriptionList>
      {Object.entries(sectionNodes).map(([sectionId, sectionNode]) => (
        <React.Fragment key={sectionId}>
          <dt>
            {showChange &&
            sectionStatuses[sectionId] === SectionStatus.Completed ? (
              <Link
                onClick={() => changeFirstAnswerInSection(sectionId)}
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
          <dd> {getTag(sectionStatuses[sectionId])} </dd>
        </React.Fragment>
      ))}
    </DescriptionList>
  );
}

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
