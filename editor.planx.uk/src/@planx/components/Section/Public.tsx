import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import visuallyHidden from "@mui/utils/visuallyHidden";
import Tag, { TagType } from "@planx/components/shared/Buttons/Tag";
import type { PublicProps } from "@planx/components/shared/types";
import { useAnalyticsTracking } from "pages/FlowEditor/lib/analytics/provider";
import { Store, useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import { SectionNode, SectionStatus as SectionStatusEnum } from "types";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml/ReactMarkdownOrHtml";

import Card from "../shared/Preview/Card";
import { CardHeader } from "../shared/Preview/CardHeader/CardHeader";
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
  extends Omit<SectionsOverviewListProps, "showChange" | "nextQuestion">,
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

  const getClickHandler = (sectionId: string, status: SectionStatusEnum) => {
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

  const getTag = (section: SectionStatusEnum, sectionTitle: string) => {
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

  return (
    <DescriptionList>
      {Object.entries(sectionNodes).map(([sectionId, sectionNode]) => {
        const status = sectionStatuses[sectionId];
        const clickHandler = getClickHandler(sectionId, status);
        const isClickable = clickHandler !== undefined;
        const statusId = `section-${sectionId}-status`;
        const hintId = `section-${sectionId}-hint`;

        return (
          <SectionRowWrapper
            key={sectionId}
            isClickable={isClickable}
            onClick={
              isClickable
                ? (e) => {
                    if (
                      e.target === e.currentTarget ||
                      !e.currentTarget
                        .querySelector("a")
                        ?.contains(e.target as Node)
                    ) {
                      clickHandler?.();
                    }
                  }
                : undefined
            }
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
              <SectionStatus id={statusId}>
                {getTag(status, sectionNode.data.title)}
              </SectionStatus>
            </SectionContent>
          </SectionRowWrapper>
        );
      })}
    </DescriptionList>
  );
}

const Table = styled("ul")(({ theme }) => ({
  padding: theme.spacing(1, 0),
  listStyle: "none",
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

const SectionRowWrapper = styled("li", {
  shouldForwardProp: (prop) => prop !== "isClickable",
})<{ isClickable?: boolean }>(({ theme, isClickable }) => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  padding: theme.spacing(2, 0),
  borderBottom: `1px solid ${theme.palette.border.main}`,
  listStyle: "none",
  [theme.breakpoints.up("md")]: {
    flexDirection: "row",
  },
  ...(isClickable && {
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.background.paper,
      "& a": {
        textDecorationThickness: "3px",
      },
    },
  }),
}));

const SectionContent = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  [theme.breakpoints.up("md")]: {
    flexDirection: "row",
  },
}));

const SectionTitleText = styled(Typography)(({ theme }) => ({
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
  color: theme.palette.text.primary,
})) as typeof Typography;

const SectionTitleLink = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: theme.typography.body1.fontSize,
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
})) as typeof Typography;

const SectionDescription = styled(Box)(({ theme }) => ({
  margin: 0,
  paddingBottom: theme.spacing(2),
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(0.33, 1, 0, 0),
    flexBasis: `calc(100% - 220px)`,
    flexShrink: 1,
    paddingBottom: 0,
  },
}));

const SectionHint = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
  color: theme.palette.text.secondary,
  "& ul": {
    listStyleType: "disc",
  },
}));

const SectionStatus = styled(Box)(({ theme }) => ({
  margin: 0,
  [theme.breakpoints.up("md")]: {
    display: "flex",
    flexBasis: "220px",
    flexShrink: 0,
    flexGrow: 1,
    justifyContent: "flex-end",
    alignItems: "flex-start",
  },
  "& > *": {
    width: "auto",
    pointerEvents: "none",
  },
}));

interface DescriptionListProps {
  children: React.ReactNode;
}

const DescriptionList: React.FC<DescriptionListProps> = ({ children }) => {
  return <Table>{children}</Table>;
};
