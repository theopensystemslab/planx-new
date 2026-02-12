import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import visuallyHidden from "@mui/utils/visuallyHidden";
import Tag, { TagType } from "@planx/components/shared/Buttons/Tag";
import type { PublicProps } from "@planx/components/shared/types";
import { useAnalyticsTracking } from "pages/FlowEditor/lib/analytics/provider";
import { Store, useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { SectionNode, SectionStatus as SectionStatusEnum } from "types";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml/ReactMarkdownOrHtml";

import Card from "../../shared/Preview/Card";
import { CardHeader } from "../../shared/Preview/CardHeader/CardHeader";
import type { Section } from "../model";
import { computeSectionStatuses } from "../model";
import {
  SectionContent,
  SectionDescription,
  SectionHint,
  SectionList,
  SectionRowWrapper,
  SectionStatus,
  SectionTitleLink,
  SectionTitleText,
} from "./styles";

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
    state.currentCard,
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
  extends
    Omit<SectionsOverviewListProps, "showChange" | "nextQuestion">,
    Props {
  currentSectionIndex: number;
  flowName: string;
  sectionNodes: Record<string, SectionNode>;
  currentCard: Store.Node | null;
  sectionCount: number;
}

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
    <CardHeader title={flowName} />
    <Box>
      <Typography variant="h3" component="h2" pb="0.25em">
        Form incomplete.
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

export type SectionsOverviewListProps = {
  flow: Store.Flow;
  showChange: boolean;
  changeAnswer: (sectionId: string) => void;
  nextQuestion: () => void;
  sectionNodes: Record<string, SectionNode>;
  currentCard: Store.Node | null;
  breadcrumbs: Store.Breadcrumbs;
  cachedBreadcrumbs?: Store.CachedBreadcrumbs;
  isReconciliation?: boolean;
  alteredSectionIds?: string[];
};

const getClickHandler = (
  sectionId: string,
  status: SectionStatusEnum,
  showChange: boolean,
  changeFirstAnswerInSection: (sectionId: string) => void,
  nextQuestion: () => void,
) => {
  if (showChange && status === SectionStatusEnum.Completed) {
    return () => changeFirstAnswerInSection(sectionId);
  }
  if (
    status === SectionStatusEnum.NeedsUpdated ||
    status === SectionStatusEnum.ReadyToStart ||
    status === SectionStatusEnum.ReadyToContinue
  ) {
    return () => nextQuestion();
  }
  return undefined;
};

const getTag = (section: SectionStatusEnum) => {
  const tagTypes: Record<SectionStatusEnum, TagType> = {
    [SectionStatusEnum.NeedsUpdated]: TagType.Alert,
    [SectionStatusEnum.ReadyToStart]: TagType.Active,
    [SectionStatusEnum.ReadyToContinue]: TagType.Active,
    [SectionStatusEnum.Started]: TagType.Notice,
    [SectionStatusEnum.NotStarted]: TagType.Notice,
    [SectionStatusEnum.Completed]: TagType.Success,
  };
  const tagType = tagTypes[section];

  return <Tag tagType={tagType}>{section}</Tag>;
};

interface SectionRowProps {
  sectionId: string;
  sectionNode: SectionNode;
  status: SectionStatusEnum;
  showChange: boolean;
  changeFirstAnswerInSection: (sectionId: string) => void;
  nextQuestion: () => void;
}

const SectionRow: React.FC<SectionRowProps> = ({
  sectionId,
  sectionNode,
  status,
  showChange,
  changeFirstAnswerInSection,
  nextQuestion,
}) => {
  const clickHandler = getClickHandler(
    sectionId,
    status,
    showChange,
    changeFirstAnswerInSection,
    nextQuestion,
  );
  const isClickable = clickHandler !== undefined;
  const statusId = `section-${sectionId}-status`;
  const hintId = `section-${sectionId}-hint`;

  const handleClick = (e: React.MouseEvent) => {
    if (
      isClickable &&
      (e.target === e.currentTarget ||
        !e.currentTarget.querySelector("a")?.contains(e.target as Node))
    ) {
      clickHandler?.();
    }
  };

  return (
    <SectionRowWrapper
      isClickable={isClickable}
      onClick={isClickable ? handleClick : undefined}
    >
      <SectionContent>
        <SectionDescription>
          {isClickable ? (
            <SectionTitleLink variant="subtitle1" component="h4">
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  clickHandler?.();
                }}
                aria-describedby={
                  sectionNode.data.description
                    ? `${hintId} ${statusId}`
                    : statusId
                }
              >
                {showChange && status === SectionStatusEnum.Completed && (
                  <span style={visuallyHidden}>{`Change `}</span>
                )}
                {sectionNode.data.title}
              </Link>
            </SectionTitleLink>
          ) : (
            <SectionTitleText variant="subtitle1" component="h4">
              {sectionNode.data.title}
            </SectionTitleText>
          )}
          {sectionNode.data.description && (
            <SectionHint id={hintId}>
              <ReactMarkdownOrHtml
                source={sectionNode.data.description}
                openLinksOnNewTab
              />
            </SectionHint>
          )}
        </SectionDescription>
        <SectionStatus id={statusId}>{getTag(status)}</SectionStatus>
      </SectionContent>
    </SectionRowWrapper>
  );
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

  const { trackEvent } = useAnalyticsTracking();

  const changeFirstAnswerInSection = (sectionId: string) => {
    const sectionIndex = flow._root.edges?.indexOf(sectionId);
    if (sectionIndex !== undefined) {
      const firstNodeInSection = flow._root.edges?.[sectionIndex + 1];
      if (firstNodeInSection) {
        trackEvent({
          event: "backwardsNavigation",
          metadata: null,
          initiator: "change",
          nodeId: firstNodeInSection,
        });
        changeAnswer(firstNodeInSection);
      }
    }
  };

  return (
    <DescriptionList>
      {Object.entries(sectionNodes).map(([sectionId, sectionNode]) => (
        <SectionRow
          key={sectionId}
          sectionId={sectionId}
          sectionNode={sectionNode}
          status={sectionStatuses[sectionId]}
          showChange={showChange}
          changeFirstAnswerInSection={changeFirstAnswerInSection}
          nextQuestion={nextQuestion}
        />
      ))}
    </DescriptionList>
  );
}

interface DescriptionListProps {
  children: React.ReactNode;
}

const DescriptionList: React.FC<DescriptionListProps> = ({ children }) => {
  return <SectionList>{children}</SectionList>;
};
