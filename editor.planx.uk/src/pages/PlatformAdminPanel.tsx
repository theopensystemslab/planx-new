import Close from "@mui/icons-material/Close";
import Done from "@mui/icons-material/Done";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { SummaryListTable } from "@planx/components/shared/Preview/SummaryList";
import EditorNavMenu, { globalLayoutRoutes } from "components/EditorNavMenu";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import useSWR from "swr";
import { AdminPanelData } from "types";
import Dashboard from "ui/editor/Dashboard";
import Caret from "ui/icons/Caret";

const StyledTeamAccordion = styled(Accordion, {
  shouldForwardProp: (prop) => prop !== "primaryColour",
})<{ primaryColour?: string }>(({ theme, primaryColour }) => ({
  borderTop: "none", // TODO figure out how to remove top border (box shadow?) when collapsed
  borderLeft: `10px solid ${primaryColour}`,
  backgroundColor: theme.palette.background.paper,
  width: "100%",
  position: "relative",
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1),
  "&::after": {
    position: "absolute",
    width: "100%",
  },
}));

function Component() {
  const adminPanelData = useStore((state) => state.adminPanelData);

  return (
    <Dashboard>
      <EditorNavMenu routes={globalLayoutRoutes} />
      <Container maxWidth={false}>
        <Box sx={{ overflow: "hidden" }}>
          <Typography variant="h1">Platform Admin Panel</Typography>
          <Typography variant="body1" mb={3}>
            {`This is an overview of each team's integrations and settings for the `}
            <strong>{process.env.REACT_APP_ENV}</strong>
            {` environment`}
          </Typography>
          {adminPanelData?.map((team) => (
            <TeamData key={team.id} data={team} />
          ))}
        </Box>
      </Container>
    </Dashboard>
  );
}

interface TeamData {
  data: AdminPanelData;
}

const NotConfigured: React.FC = () => <Close color="error" fontSize="small" />;

const Configured: React.FC = () => <Done color="success" fontSize="small" />;

const TeamData: React.FC<TeamData> = ({ data }) => {
  const a4Endpoint = `${process.env.REACT_APP_API_URL}/gis/${data.slug}/article4-schema`;
  const fetcher = (url: string) => fetch(url).then((r) => r.json());
  const { data: a4Check, isValidating } = useSWR(
    () => (data.slug ? a4Endpoint : null),
    fetcher,
  );

  return (
    <StyledTeamAccordion primaryColour={data.primaryColour} elevation={0}>
      <AccordionSummary
        id={`${data.name}-header`}
        aria-controls={`${data.name}-panel`}
        expandIcon={<Caret />}
        sx={{ pr: 1.5 }}
      >
        <Typography variant="h2">{data.name}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid
          container
          direction="row"
          justifyContent="flex-start"
          alignItems="flex-start"
          spacing={3}
        >
          <Grid item xs={4}>
            <SummaryListTable dense={true}>
              <>
                <Box component="dt">{"Slug"}</Box>
                <Box component="dd">
                  <code>
                    {`/`}
                    {data.slug}
                  </code>
                </Box>
              </>
              <>
                <Box component="dt">{"Homepage"}</Box>
                <Box component="dd">{data.homepage || <NotConfigured />}</Box>
              </>
              <>
                <Box component="dt">{"Logo"}</Box>
                <Box component="dd">
                  {data.logo ? <Configured /> : <NotConfigured />}
                </Box>
              </>
              <>
                <Box component="dt">{"Favicon"}</Box>
                <Box component="dd">
                  {data.favicon ? <Configured /> : <NotConfigured />}
                </Box>
              </>
            </SummaryListTable>
          </Grid>
          <Grid item xs={4}>
            <SummaryListTable dense={true}>
              <>
                <Box component="dt">{"Planning constraints"}</Box>
                <Box component="dd">
                  {data.planningDataEnabled ? (
                    <Configured />
                  ) : (
                    <NotConfigured />
                  )}
                </Box>
              </>
              <>
                <Box component="dt">{"Article 4s (API)"}</Box>
                <Box component="dd">
                  {!isValidating && a4Check?.status ? (
                    <Configured />
                  ) : (
                    <NotConfigured />
                  )}
                </Box>
              </>
              <>
                <Box component="dt">{"Reference code"}</Box>
                <Box component="dd">
                  {data.referenceCode || <NotConfigured />}
                </Box>
              </>
              <>
                <Box component="dt">{"Subdomain"}</Box>
                <Box component="dd">{data.subdomain || <NotConfigured />}</Box>
              </>
            </SummaryListTable>
          </Grid>
          <Grid item xs={4}>
            <SummaryListTable dense={true}>
              <>
                <Box component="dt">{"GOV.UK Notify"}</Box>
                <Box component="dd">
                  {data.govnotifyPersonalisation?.helpEmail || (
                    <NotConfigured />
                  )}
                </Box>
              </>
              <>
                <Box component="dt">{"GOV.UK Pay"}</Box>
                <Box component="dd">
                  {data.govpayEnabled ? <Configured /> : <NotConfigured />}
                </Box>
              </>
              <>
                <Box component="dt">{"Send to email"}</Box>
                <Box component="dd">
                  {data.sendToEmailAddress || <NotConfigured />}
                </Box>
              </>
              <>
                <Box component="dt">{"BOPS"}</Box>
                <Box component="dd">
                  {data.bopsSubmissionURL ? <Configured /> : <NotConfigured />}
                </Box>
              </>
            </SummaryListTable>
          </Grid>
        </Grid>
      </AccordionDetails>
    </StyledTeamAccordion>
  );
};

export default Component;
