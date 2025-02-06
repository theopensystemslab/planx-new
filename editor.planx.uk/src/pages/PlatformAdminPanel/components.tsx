import Close from "@mui/icons-material/Close";
import Done from "@mui/icons-material/Done";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";
import { SummaryListTable } from "@planx/components/shared/Preview/SummaryList";
import capitalize from "lodash/capitalize";
import React from "react";
import useSWR from "swr";
import { AdminPanelData } from "types";
import Caret from "ui/icons/Caret";

import { StyledTeamAccordion } from "./styles";

interface TeamData {
  data: AdminPanelData;
}

const NotConfigured: React.FC = () => <Close color="error" fontSize="small" />;

const Configured: React.FC = () => <Done color="success" fontSize="small" />;

export const TeamData: React.FC<TeamData> = ({ data }) => {
  const environment = `${import.meta.env.VITE_APP_ENV}`;
  const a4Endpoint = `${import.meta.env.VITE_APP_API_URL}/gis/${
    data.slug
  }/article4-schema`;
  const fetcher = (url: string) => fetch(url).then((r) => r.json());
  const { data: a4Check, isValidating } = useSWR(
    () => (data.slug ? a4Endpoint : null),
    fetcher
  );

  const rows: GridRowsProp = [{ id: 1, favicon: "Hello", subdomain: "World" }];

  const serviceTableRows: GridRowsProp = Array.from(
    { length: data.liveFlows && data.liveFlows.length < 10 ? data.liveFlows.length : 10 },
    (_, index) => ({
      id: index,
      liveServices: data.liveFlows ? data?.liveFlows[index] : null,
    })
  );

  const columns: Record<string, GridColDef[]> = {
    customisations: [
      {
        field: "logo",
        headerName: "Logo",
        width: 150,
        renderCell: (_params) => {
          return data.logo ? <Configured /> : <NotConfigured />;
        },
      },
      {
        field: "favicon",
        headerName: "Favicon",
        width: 150,
        renderCell: (_params) => {
          return data.favicon ? <Configured /> : <NotConfigured />;
        },
      },
      {
        field: "subdomain",
        headerName: "Subdomain",
        width: 150,
        renderCell: (_params) => {
          return data.subdomain ? <Configured /> : <NotConfigured />;
        },
      },
    ],
    flows: [{ field: "liveServices", headerName: "Live services", width: 650 }],
    integrations: [
      {
        field: "planningConstraints",
        headerName: "Planning constraints",
        width: 150,
        renderCell: (_params) => {
          return data.planningDataEnabled ? <Configured /> : <NotConfigured />;
        },
      },
      {
        field: "article4s",
        headerName: "Article 4s (API)",
        width: 150,
        renderCell: (_params) => {
          return !isValidating && a4Check?.status ? (
            <Configured />
          ) : (
            <NotConfigured />
          );
        },
      },
      {
        field: "govPay",
        headerName: "GOV.UK Pay",
        width: 150,
        renderCell: (_params) => {
          return data.govpayEnabled ? <Configured /> : <NotConfigured />;
        },
      },
      {
        field: "sendToEmail",
        headerName: "Send to email",
        width: 150,
        renderCell: (_params) => {
          return data.sendToEmailAddress ? <Configured /> : <NotConfigured />;
        },
      },
      {
        field: "bops",
        headerName: "BOPS",
        width: 150,
        renderCell: (_params) => {
          return data.bopsSubmissionURL ? <Configured /> : <NotConfigured />;
        },
      },
      {
        field: "powerAutomate",
        headerName: "Power automate",
        width: 150,
        renderCell: (_params) => {
          return data.powerAutomateEnabled ? <Configured /> : <NotConfigured />;
        },
      },
    ],
  };

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
            </SummaryListTable>
          </Grid>
          <Grid item xs={12} md={4} width="100%">
            <SummaryListTable dense={true}>
              <>
                <Box component="dt">{"Reference code"}</Box>
                <Box component="dd">
                  {data.referenceCode || <NotConfigured />}
                </Box>
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
            </SummaryListTable>
          </Grid>
        </Grid>
      </AccordionDetails>
      <Typography mx={3} variant="h4" component="h3">
        {capitalize(environment)} integrations
      </Typography>
      <div style={{ width: "100%" }}>
        <DataGrid
          sx={{ margin: 3 }}
          rows={rows}
          columns={columns.integrations}
          hideFooter
        />
      </div>
      <Typography mx={3} variant="h4" component="h3">
        Customisations
      </Typography>
      <div style={{ width: "100%" }}>
        <DataGrid
          sx={{ margin: 3 }}
          rows={rows}
          columns={columns.customisations}
          hideFooter
        />
      </div>
      <Typography mx={3} variant="h4" component="h3">
        Services
      </Typography>
      <div style={{ width: "100%" }}>
        <DataGrid
          sx={{ margin: 3 }}
          rows={serviceTableRows}
          columns={columns.flows}
          hideFooter
        />
      </div>
    </StyledTeamAccordion>
  );
};
