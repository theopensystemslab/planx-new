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
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import useSWR from "swr";
import { AdminPanelData } from "types";
import SettingsSection from "ui/editor/SettingsSection";
import Caret from "ui/icons/Caret";

const StyledTeamAccordion = styled(Accordion, {
  shouldForwardProp: (prop) => prop !== "primaryColour",
})<{ primaryColour?: string }>(({ theme, primaryColour }) => ({
  backgroundColor: theme.palette.background.paper,
  outline: `1px solid ${theme.palette.border.light}`,
  width: "100%",
  position: "relative",
  "&::before": {
    display: "none",
  },
  "&::after": {
    content: "''",
    position: "absolute",
    left: 0,
    top: 0,
    width: theme.spacing(1.5),
    height: "100%",
    backgroundColor: primaryColour,
  },
}));

function Component() {
  const adminPanelData = useStore((state) => state.adminPanelData);

  return (
    <Container maxWidth={false}>
      <SettingsSection>
        <Typography variant="h2" component="h1" gutterBottom>
          Platform Admin Panel
        </Typography>
        <Typography variant="body1">
          {`This is an overview of each team's integrations and settings for the `}
          <strong>{import.meta.env.VITE_APP_ENV}</strong>
          {` environment.`}
        </Typography>
      </SettingsSection>
      <SettingsSection>
        {adminPanelData?.map((team) => <TeamData key={team.id} data={team} />)}
      </SettingsSection>
    </Container>
  );
}

interface TeamData {
  data: AdminPanelData;
}

const NotConfigured: React.FC = () => <Close color="error" fontSize="small" />;

const Configured: React.FC = () => <Done color="success" fontSize="small" />;

const TeamData: React.FC<TeamData> = ({ data }) => {
  const a4Endpoint = `${import.meta.env.VITE_APP_API_URL}/gis/${
    data.slug
  }/article4-schema`;
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
        sx={{ p: 1.5, pl: 3 }}
      >
        <Typography variant="h3" component="h2">
          {data.name}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid
          container
          direction={{ xs: "column", lg: "row" }}
          justifyContent="flex-start"
          alignItems="flex-start"
          spacing={3}
          px={1.5}
        >
          <Grid item xs={12} md={4} width="100%">
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
          <Grid item xs={12} md={4} width="100%">
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
          <Grid item xs={12} md={4} width="100%">
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
