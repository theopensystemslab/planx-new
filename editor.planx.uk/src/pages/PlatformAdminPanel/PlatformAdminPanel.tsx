import Close from "@mui/icons-material/Close";
import Done from "@mui/icons-material/Done";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import SettingsSection from "ui/editor/SettingsSection";

const Configured: React.FC = () => <Done color="success" fontSize="small" />;

const NotConfigured: React.FC = () => <Close color="error" fontSize="small" />;

export const PlatformAdminPanel = () => {
  const adminPanelData = useStore((state) => state.adminPanelData);

  const baseColDef: Partial<GridColDef> = {
    width: 150,
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
      renderCell: (_params) => {
        return _params.value ? <Configured /> : <NotConfigured />;
      },
    },
    {
      ...baseColDef,
      field: "govpayEnabled",
      headerName: "GOV.UK Pay",
      renderCell: (_params) => {
        return _params.value ? <Configured /> : <NotConfigured />;
      },
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
      renderCell: (_params) => {
        return _params.value ? <Configured /> : <NotConfigured />;
      },
    },
    {
      ...baseColDef,
      field: "bopsSubmissionURL",
      headerName: "BOPS",
      renderCell: (_params) => {
        return _params.value ? <Configured /> : <NotConfigured />;
      },
    },
    {
      ...baseColDef,
      field: "powerAutomateEnabled",
      headerName: "Power automate",
      renderCell: (_params) => {
        return _params.value ? <Configured /> : <NotConfigured />;
      },
    },
    {
      ...baseColDef,
      field: "subdomain",
      headerName: "Subdomain",
      renderCell: (_params) => {
        return _params.value ? <Configured /> : <NotConfigured />;
      },
    },
    {
      ...baseColDef,
      field: "logo",
      headerName: "Logo",
      renderCell: (_params) => {
        return _params.value ? <Configured /> : <NotConfigured />;
      },
    },
    {
      ...baseColDef,
      field: "favicon",
      headerName: "Favicon",
      renderCell: (_params) => {
        return _params.value ? <Configured /> : <NotConfigured />;
      },
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
        <DataGrid
          rows={adminPanelData}
          columns={columns}
          getRowHeight={() => "auto"}
          sx={{
            ".MuiDataGrid-cell": {
              padding: "10px",
              display: "flex",
            },
          }}
        />
      </SettingsSection>
    </Container>
  );
};
