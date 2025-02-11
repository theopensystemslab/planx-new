import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import {
  GridColDef,
  GridRenderCellParams,
  GridTreeNodeWithRender,
} from "@mui/x-data-grid";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { AdminPanelData } from "types";
import SettingsSection from "ui/editor/SettingsSection";
import { DataTable } from "ui/shared/DataTable/DataTable";

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

  const renderIsItemConfigured = (
    params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>,
  ) => {
    return params.value ? <Configured /> : <NotConfigured />;
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Team",
    },
    {
      field: "referenceCode",
      headerName: "Reference code",
    },

    {
      field: "liveFlows",
      headerName: "Live services",
      width: 450,
      renderCell: (params) => {
        return (
          <Box
            component={"ol"}
            padding={0}
            margin={0}
            sx={{ listStyleType: "none" }}
          >
            {params.value?.map((flowName: string, index: number) => {
              return (
                <Typography
                  py={0.4}
                  variant="body2"
                  key={index}
                  component={"li"}
                >
                  {flowName}
                </Typography>
              );
            })}
          </Box>
        );
      },
    },
    {
      field: "planningDataEnabled",
      headerName: "Planning constraints",
      renderCell: renderIsItemConfigured,
    },
    {
      field: "article4sEnabled",
      headerName: "Article 4s (API)",
      renderCell: (params) => {
        return <Article4Status teamSlug={params.row.slug} />;
      },
    },
    {
      field: "govpayEnabled",
      headerName: "GOV.UK Pay",
      renderCell: renderIsItemConfigured,
    },
    {
      field: "govnotifyPersonalisation",
      headerName: "GOV.UK Notify",
      renderCell: (params) => {
        return params.value?.helpEmail ? <Configured /> : <NotConfigured />;
      },
    },
    {
      field: "sendToEmailAddress",
      headerName: "Send to email",
      renderCell: renderIsItemConfigured,
    },
    {
      field: "bopsSubmissionURL",
      headerName: "BOPS",
      renderCell: renderIsItemConfigured,
    },
    {
      field: "powerAutomateEnabled",
      headerName: "Power automate",
      renderCell: renderIsItemConfigured,
    },
    {
      field: "subdomain",
      headerName: "Subdomain",
      renderCell: renderIsItemConfigured,
    },
    {
      field: "logo",
      headerName: "Logo",
      renderCell: renderIsItemConfigured,
    },
    {
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
        <DataTable rows={filteredPanelData} columns={columns} />
      </SettingsSection>
    </Container>
  );
};
