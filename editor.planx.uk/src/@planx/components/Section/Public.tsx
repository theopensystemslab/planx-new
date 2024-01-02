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
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml";

import Card from "../shared/Preview/Card";
import QuestionHeader from "../shared/Preview/QuestionHeader";
import type { Section } from "./model";
import { computeSectionStatuses } from "./model";

export type Props = PublicProps<Section>;

export default function Component(props: Props) {
  const [
    breadcrumbs,
    cachedBreadcrumbs,
    changeAnswer,
    currentCard,
    currentSectionIndex,
    flow,
    flowName,
    sectionCount,
    sectionNodes,
  ] = useStore((state) => [
    state.breadcrumbs,
    state.cachedBreadcrumbs,
    state.changeAnswer,
    state.currentCard(),
    state.currentSectionIndex,
    state.flow,
    state.flowName,
    state.sectionCount,
    state.sectionNodes,
  ]);

  return (
    <Root
      {...props}
      breadcrumbs={breadcrumbs}
      cachedBreadcrumbs={cachedBreadcrumbs}
      changeAnswer={changeAnswer}
      currentCard={currentCard}
      currentSectionIndex={currentSectionIndex}
      flow={flow}
      flowName={flowName}
      sectionCount={sectionCount}
      sectionNodes={sectionNodes}
    />
  );
}

interface RootProps
  extends Omit<SectionsOverviewListProps, "showChange" | "nextQuestion">,
    Props {
  currentSectionIndex: number;
  flowName: string;
  sectionNodes: Record<string, SectionNode>;
  currentCard: Store.node | null;
  sectionCount: number;
}

// Stateless component to simplify testing of the "Section" component
export const Root = ({
  currentSectionIndex,
  flowName,
  handleSubmit,
  sectionNodes,
  currentCard,
  sectionCount,
  ...props
}: RootProps) => (
  <Card isValid handleSubmit={handleSubmit}>
    <QuestionHeader title={flowName} />
    <Box>
      <Typography variant="h3" component="h2" pb="0.25em">
        Application incomplete.
      </Typography>
      <Typography variant="subtitle2" component="h3">
        {`You have completed ${
          Object.keys(sectionNodes)[0] === currentCard?.id
            ? 0
            : currentSectionIndex
        } of ${sectionCount} sections`}
      </Typography>
    </Box>
    <SectionsOverviewList
      {...props}
      currentCard={currentCard}
      sectionNodes={sectionNodes}
      showChange={true}
      nextQuestion={() => handleSubmit && handleSubmit()}
    />
  </Card>
);

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
    const tagType = tagTypes[section];

    const onClick =
      tagType == TagType.Alert || tagType == TagType.Active
        ? () => nextQuestion()
        : () => {}; // no-op

    return (
      <Tag tagType={tagType} onClick={onClick}>
        {section}
      </Tag>
    );
  };

  return (
    <DescriptionList>
      {Object.entries(sectionNodes).map(([sectionId, sectionNode]) => (
        <SectionRow key={sectionId}>
          <SectionTitle>
            {showChange &&
            sectionStatuses[sectionId] === SectionStatus.Completed ? (
              <Link
                onClick={() => changeFirstAnswerInSection(sectionId)}
                component="button"
              >
                <Typography
                  variant="subtitle1"
                  component="h4"
                  color="primary"
                  align="left"
                >
                  <span style={visuallyHidden}>{`Change `}</span>
                  <strong>{sectionNode.data.title}</strong>
                </Typography>
              </Link>
            ) : (
              <Typography variant="subtitle1" component="h4" color="inherit">
                <strong>{sectionNode.data.title}</strong>
              </Typography>
            )}
            <ReactMarkdownOrHtml
              source={sectionNode.data.description}
              openLinksOnNewTab
            />
          </SectionTitle>
          <SectionState> {getTag(sectionStatuses[sectionId])} </SectionState>
        </SectionRow>
      ))}
    </DescriptionList>
  );
}

const Table = styled("dl")(({ theme }) => ({
  padding: theme.spacing(1, 0),
  "& ul, & ol": {
    padding: "0 0 0 1em",
    "& p": {
      marginTop: "0.5em",
    },
    "&:last-of-type": {
      marginBottom: 0,
    },
  },
}));

const SectionRow = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  padding: theme.spacing(2, 0),
  borderBottom: `1px solid ${theme.palette.border.main}`,
  [theme.breakpoints.up("md")]: {
    flexDirection: "row",
  },
}));

const SectionTitle = styled("dt")(({ theme }) => ({
  margin: 0,
  paddingBottom: theme.spacing(2),
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(0.33, 1, 0, 0),
    flexBasis: `calc(100% - 220px)`,
    flexShrink: 1,
  },
}));

const SectionState = styled("dd")(({ theme }) => ({
  margin: 0,
  [theme.breakpoints.up("md")]: {
    display: "flex",
    flexBasis: "220px",
    flexShrink: 0,
    flexGrow: 1,
    justifyContent: "flex-end",
    alignItems: "flex-start",
  },
  "& > button": {
    width: "auto",
  },
}));

interface DescriptionListProps {
  children: React.ReactNode;
}

const DescriptionList: React.FC<DescriptionListProps> = ({ children }) => {
  return <Table>{children}</Table>;
};
