import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import { useTheme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Warning from "@material-ui/icons/WarningOutlined";
import Card from "@planx/components/shared/Preview/Card";
import SummaryList from "@planx/components/shared/Preview/SummaryList";
import { useStore } from "pages/FlowEditor/lib/store";
import { sortBreadcrumbs } from "pages/FlowEditor/lib/store/preview";
import React from "react";
import Banner from "ui/Banner";

interface Props {
  bannerHeading: string;
  diffMessage: string;
  data: any;
  buttonText?: string;
  onButtonClick?: () => void;
}

const useStyles = makeStyles((theme) => ({
  warningIcon: {
    padding: theme.spacing(2.5),
  },
  warningMessage: {
    paddingLeft: theme.spacing(1),
  },
}));

const ReconciliationPage: React.FC<Props> = ({
  bannerHeading,
  diffMessage,
  data,
  buttonText,
  onButtonClick,
}) => {
  const [flow, changeAnswer] = useStore((state) => [
    state.flow,
    state.changeAnswer,
  ]);

  const sortedBreadcrumbs = sortBreadcrumbs(
    data?.reconciledSessionData?.breadcrumbs,
    flow
  );

  const theme = useTheme();
  const classes = useStyles();

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
        {data?.removedBreadcrumbs &&
          Object.keys(data.removedBreadcrumbs).length > 0 && (
            <Box display="flex" mb={4}>
              <Warning
                titleAccess="Warning"
                color="primary"
                fontSize="large"
                className={classes.warningIcon}
              />
              <Typography variant="body2" className={classes.warningMessage}>
                {diffMessage}
              </Typography>
            </Box>
          )}
        <Typography variant="h3" component="h2">
          Review your answers so far
        </Typography>
        <SummaryList
          breadcrumbs={sortedBreadcrumbs}
          flow={flow}
          passport={data?.reconciledSessionData?.passport}
          changeAnswer={changeAnswer}
          showChangeButton={false}
        />
        {buttonText && (
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={onButtonClick}
          >
            {buttonText}
          </Button>
        )}
      </Card>
    </>
  );
};

export default ReconciliationPage;
