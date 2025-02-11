import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridTreeNodeWithRender,
} from "@mui/x-data-grid";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import { AdminPanelData } from "types";
import SettingsSection from "ui/editor/SettingsSection";

import { Article4Status } from "./components/Article4Status";
import { Configured, NotConfigured } from "./components/icons";

export const PlatformAdminPanel = () => {
  const adminPanelData: AdminPanelData[] | undefined = useStore(
    (state) => state.adminPanelData,
  );

  const teamsToFilterOut = [
    "WikiHouse",
    "PlanX",
    "Open Systems Lab",
    "Testing",
    "Open Digital Planning",
    "Environment Agency",
    "Templates",
  ];

  const filteredPanelData = adminPanelData?.filter(
    (team) => !teamsToFilterOut.includes(team.name),
  );

  const baseColDef: Partial<GridColDef> = {
    width: 150,
  };

  const renderIsItemConfigured = (
    _params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>,
  ) => {
    return _params.value ? <Configured /> : <NotConfigured />;
  };

  const columns: GridColDef[] = [
    {
      ...baseColDef,
      field: "name",
      headerName: "Team",
    },
    {
      ...baseColDef,
      field: "referenceCode",
      headerName: "Reference code",
    },

    {
      ...baseColDef,
      field: "liveFlows",
      headerName: "Live services",
      width: 450,
      renderCell: (_params) => {
        return (
          <Box>
            {_params.value?.map((flowName: string, index: number) => {
              return (
                <Typography py={0.3} variant="body2" key={index}>
                  {flowName}
                </Typography>
              );
            })}
          </Box>
        );
      },
    },
    {
      ...baseColDef,
      field: "planningDataEnabled",
      headerName: "Planning constraints",
      renderCell: renderIsItemConfigured,
    },
    {
      ...baseColDef,
      field: "article4sEnabled",
      headerName: "Article 4s (API)",
      renderCell: (_params) => {
        return <Article4Status teamSlug={_params.row.slug} />;
      },
    },
    {
      ...baseColDef,
      field: "govpayEnabled",
      headerName: "GOV.UK Pay",
      renderCell: renderIsItemConfigured,
    },
    {
      ...baseColDef,
      field: "govnotifyPersonalisation",
      headerName: "GOV.UK Notify",
      renderCell: (_params) => {
        return _params.value?.helpEmail ? <Configured /> : <NotConfigured />;
      },
    },
    {
      ...baseColDef,
      field: "sendToEmailAddress",
      headerName: "Send to email",
      renderCell: renderIsItemConfigured,
    },
    {
      ...baseColDef,
      field: "bopsSubmissionURL",
      headerName: "BOPS",
      renderCell: renderIsItemConfigured,
    },
    {
      ...baseColDef,
      field: "powerAutomateEnabled",
      headerName: "Power automate",
      renderCell: renderIsItemConfigured,
    },
    {
      ...baseColDef,
      field: "subdomain",
      headerName: "Subdomain",
      renderCell: renderIsItemConfigured,
    },
    {
      ...baseColDef,
      field: "logo",
      headerName: "Logo",
      renderCell: renderIsItemConfigured,
    },
    {
      ...baseColDef,
      field: "favicon",
      headerName: "Favicon",
      renderCell: renderIsItemConfigured,
    },
  ];

  return (
    <Container maxWidth={false}>
      <SettingsSection>
        <Typography variant="h2" component="h1" gutterBottom>
          Platform admin panel
        </Typography>
        <Typography variant="body1">
          {`This is an overview of each team's integrations and settings for the `}
          <strong>{import.meta.env.VITE_APP_ENV}</strong>
          {` environment.`}
        </Typography>
      </SettingsSection>
      <SettingsSection>
        <Box sx={{ height: "100vh", flex: 1, position: "relative" }}>
          <Box sx={{ inset: 0, position: "absolute" }}>
            <DataGrid
              rows={filteredPanelData}
              columns={columns}
              getRowHeight={() => "auto"}
              sx={{
                ".MuiDataGrid-cell": {
                  padding: "10px",
                  display: "flex",
                },
                ".MuiDataGrid-columnHeaderTitle": {
                  fontWeight: FONT_WEIGHT_SEMI_BOLD,
                },
              }}
            />
          </Box>
        </Box>
      </SettingsSection>
    </Container>
  );
};
