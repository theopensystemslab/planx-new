import Warning from "@mui/icons-material/WarningOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";
import { SectionsOverviewList } from "@planx/components/Section/Public";
import Card from "@planx/components/shared/Preview/Card";
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
  const [flow, sectionNodes, sectionStatuses] = useStore((state) => [
    state.flow,
    state.sectionNodes,
    state.sectionStatuses(),
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
        <SectionsOverviewList
          sectionNodes={sectionNodes}
          sectionStatuses={sectionStatuses}
          showChange={false}
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
