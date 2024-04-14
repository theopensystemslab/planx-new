import Close from "@mui/icons-material/Close";
import Done from "@mui/icons-material/Done";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { SummaryListTable } from "@planx/components/shared/Preview/SummaryList";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { AdminPanelData } from "types";

const StyledTeam = styled(Box, {
  shouldForwardProp: (prop) => prop !== "primaryColour",
})<{ primaryColour?: string }>(({ theme, primaryColour }) => ({
  border: `10px solid ${theme.palette.divider}`,
  borderLeft: `10px solid ${primaryColour}`,
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2),
}));

function Component() {
  const adminPanelData = useStore((state) => state.adminPanelData);

  return (
    <Box p={3}>
      <Typography variant="h1">Platform Admin Panel</Typography>
      <Typography variant="body1" mb={3}>
        {`This is an overview of each team's integrations and settings for the **${process.env.NODE_ENV}** environment`}
      </Typography>
      {adminPanelData?.map((team) => <TeamData data={team} />)}
    </Box>
  );
}

interface TeamData {
  data: AdminPanelData;
}

const NotConfigured: React.FC = () => <Close color="error" fontSize="small" />;

const Configured: React.FC = () => <Done color="success" fontSize="small" />;

const TeamData: React.FC<TeamData> = ({ data }) => {
  return (
    <StyledTeam primaryColour={data.primaryColour} key={data.id}>
      <Typography variant="h2" mb={2}>
        {data.name}
      </Typography>
      <Grid
        container
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-end"
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
              <Box component="dt">{"Reference code"}</Box>
              <Box component="dd">
                {data.referenceCode || <NotConfigured />}
              </Box>
            </>
            <>
              <Box component="dt">{"Homepage"}</Box>
              <Box component="dd">{data.homepage || <NotConfigured />}</Box>
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
              <Box component="dt">{"Planning constraints"}</Box>
              <Box component="dd">
                {data.planningDataEnabled ? <Configured /> : <NotConfigured />}
              </Box>
            </>
            <>
              <Box component="dt">{"Article 4s"}</Box>
              <Box component="dd">{"?"}</Box>
            </>
            <>
              <Box component="dt">{"GOV.UK Notify"}</Box>
              <Box component="dd">
                {data.govnotifyPersonalisation?.helpEmail || <NotConfigured />}
              </Box>
            </>
            <>
              <Box component="dt">{"GOV.UK Pay"}</Box>
              <Box component="dd">
                {data.govpayEnabled ? <Configured /> : <NotConfigured />}
              </Box>
            </>
          </SummaryListTable>
        </Grid>
        <Grid item xs={4}>
          <SummaryListTable dense={true}>
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
    </StyledTeam>
  );
};

export default Component;
