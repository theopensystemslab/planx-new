import Warning from "@mui/icons-material/WarningOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { SectionsOverviewList } from "@planx/components/Section/Public";
import Card from "@planx/components/shared/Preview/Card";
import SummaryListsBySections from "@planx/components/shared/Preview/SummaryList";
import { TYPES } from "@planx/components/types";
import { useStore } from "pages/FlowEditor/lib/store";
import { sortBreadcrumbs } from "pages/FlowEditor/lib/store/preview";
import React from "react";
import type { ReconciliationResponse } from "types";
import Banner from "ui/Banner";

interface Props {
  bannerHeading: string;
  reconciliationResponse: ReconciliationResponse;
  buttonText?: string;
  onButtonClick?: () => void;
}

const ReconciliationPage: React.FC<Props> = ({
  bannerHeading,
  reconciliationResponse,
  buttonText,
  onButtonClick,
}) => {
  const [
    flow,
    hasSections,
    sectionNodes,
    currentCard,
    changeAnswer,
    record,
    passport,
  ] = useStore((state) => [
    state.flow,
    state.hasSections,
    state.sectionNodes,
    state.currentCard(),
    state.changeAnswer,
    state.record,
    state.computePassport(),
  ]);

  const nextQuestion = () => {
    if (onButtonClick) {
      onButtonClick();
    }
    // skip current card if it is a section
    if (currentCard && currentCard.id && currentCard.type === TYPES.Section) {
      record(currentCard.id, { auto: false });
    }
  };

  const sortedBreadcrumbs = sortBreadcrumbs(
    reconciliationResponse.reconciledSessionData.breadcrumbs,
    flow
  );

  const theme = useTheme();

  return (
    <>
      <Box width="100%">
        <Banner
          heading={bannerHeading}
          color={{
            background: theme.palette.primary.main,
            text: theme.palette.primary.contrastText,
          }}
        />
      </Box>
      <Card>
        {/* Only show a warning if the content change has affected the user's path */}
        {reconciliationResponse.changesFound && (
          <Box display="flex" mb={4}>
            <Warning
              titleAccess="Warning"
              color="primary"
              fontSize="large"
              sx={{ p: 2.5 }}
            />
            <Typography variant="body2" sx={{ pl: 1 }}>
              {reconciliationResponse.message}
            </Typography>
          </Box>
        )}
        <Typography variant="h2">
          Review your {hasSections ? "progress" : "answers"} so far
        </Typography>
        {hasSections ? (
          <SectionsOverviewList
            flow={flow}
            alteredSectionIds={reconciliationResponse.alteredSectionIds}
            changeAnswer={changeAnswer}
            nextQuestion={nextQuestion}
            showChange={false}
            isReconciliation={true}
            sectionNodes={sectionNodes}
            currentCard={currentCard}
            breadcrumbs={sortedBreadcrumbs}
          />
        ) : (
          <SummaryListsBySections
            breadcrumbs={sortedBreadcrumbs}
            flow={flow}
            passport={passport}
            changeAnswer={changeAnswer}
            showChangeButton={false}
            sectionComponent="h3"
          />
        )}
        {buttonText && (
          <Button
            variant="contained"
            color="primary"
            size="large"
            data-testid="continue-button"
            onClick={nextQuestion}
          >
            {buttonText}
          </Button>
        )}
      </Card>
    </>
  );
};

export default ReconciliationPage;
