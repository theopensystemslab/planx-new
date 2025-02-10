import Close from "@mui/icons-material/Close";
import Done from "@mui/icons-material/Done";
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

  // console.log({ adminPanelData });

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Team",
      width: 150,
    },
    {
      field: "referenceCode",
      headerName: "Reference code",
      width: 150,
    },

    {
      field: "liveFlows",
      headerName: "Live services",
      width: 350,
      renderCell: (_params) => {
        return _params.value && _params.value.join(", ");
      },
    },
    {
      field: "planningDataEnabled",
      headerName: "Planning constraints",
      width: 150,
      renderCell: (_params) => {
        return _params.value ? <Configured /> : <NotConfigured />;
      },
    },
    {
      field: "govpayEnabled",
      headerName: "GOV.UK Pay",
      width: 150,
      renderCell: (_params) => {
        return _params.value ? <Configured /> : <NotConfigured />;
      },
    },
    // Gov Notify
    // {
    //   field: "govpayEnabled",
    //   headerName: "GOV.UK Pay",
    //   width: 150,
    //   renderCell: (_params) => {
    //     return _params.value ? <Configured /> : <NotConfigured />;
    //   },
    // },
    {
      field: "sendToEmailAddress",
      headerName: "Send to email",
      width: 150,
      renderCell: (_params) => {
        return _params.value ? <Configured /> : <NotConfigured />;
      },
    },
    {
      field: "bopsSubmissionURL",
      headerName: "BOPS",
      width: 150,
      renderCell: (_params) => {
        return _params.value ? <Configured /> : <NotConfigured />;
      },
    },
    {
      field: "powerAutomateEnabled",
      headerName: "Power automate",
      width: 150,
      renderCell: (_params) => {
        return _params.value ? <Configured /> : <NotConfigured />;
      },
    },
    {
      field: "subdomain",
      headerName: "Subdomain",
      width: 150,
      renderCell: (_params) => {
        return _params.value ? <Configured /> : <NotConfigured />;
      },
    },
    {
      field: "logo",
      headerName: "Logo",
      width: 150,
      renderCell: (_params) => {
        return _params.value ? <Configured /> : <NotConfigured />;
      },
    },
    {
      field: "favicon",
      headerName: "Favicon",
      width: 150,
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
        {/* {adminPanelData?.map((team) => <TeamData key={team.id} data={team} />)} */}
        <DataGrid
          sx={{ margin: 3 }}
          rows={adminPanelData}
          columns={columns}
          hideFooter
        />
      </SettingsSection>
    </Container>
  );
};
