import Typography from "@mui/material/Typography";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import { AdminPanelData, type LiveFlow } from "types";
import FixedHeightDashboardContainer from "ui/editor/FixedHeightDashboardContainer";
import SettingsSection from "ui/editor/SettingsSection";
import { DataTable } from "ui/shared/DataTable/DataTable";
import { ColumnConfig, ColumnFilterType } from "ui/shared/DataTable/types";
import ErrorSummary from "ui/shared/ErrorSummary/ErrorSummary";

import {
  False as NotConfigured,
  True as Configured,
} from "../../ui/shared/DataTable/components/cellIcons";
import { useAdminPanel } from "./useAdminPanel";
import { formatDate, getFlowNamesForFilter } from "./utils";

export const PlatformAdminPanel = () => {
  const { data, loading, error } = useAdminPanel();
  const adminPanelData = data?.adminPanel;

  if (error) return <ErrorSummary message={error.message} />;

  const liveFlowNameValueOptions = adminPanelData
    ? getFlowNamesForFilter(adminPanelData)
    : [];

  const columns: ColumnConfig<AdminPanelData>[] = [
    {
      field: "name",
      headerName: "Team",
      type: ColumnFilterType.SINGLE_SELECT,
      customComponent: (params) => <strong>{`${params.value}`}</strong>,
      columnOptions: {
        // Allow filtering by unique team names
        valueOptions: [...new Set(adminPanelData?.map(({ name }) => name))],
      },
    },
    {
      field: "referenceCode",
      headerName: "Reference code",
    },
    {
      field: "liveFlowsNames" as keyof AdminPanelData,
      headerName: "Live services",
      width: 450,
      type: ColumnFilterType.ARRAY,
      columnOptions: {
        valueGetter: (_value: LiveFlow[], row: AdminPanelData) =>
          row.liveFlows?.map(({ name }) => name),
        valueOptions: liveFlowNameValueOptions,
        sortable: false,
      },
    },
    {
      field: "liveFlowsDates" as keyof AdminPanelData,
      headerName: "First online at",
      type: ColumnFilterType.ARRAY,
      columnOptions: {
        valueGetter: (_value: LiveFlow[], row: AdminPanelData) =>
          row.liveFlows?.map(({ firstOnlineAt }) => formatDate(firstOnlineAt)),
        filterable: false,
        sortable: false,
      },
    },
    {
      field: "planningDataEnabled",
      headerName: "Planning constraints",
      type: ColumnFilterType.BOOLEAN,
    },
    {
      field: "article4sEnabled",
      headerName: "Article 4s",
      type: ColumnFilterType.BOOLEAN,
    },
    {
      field: "govpayEnabled",
      headerName: "GOV.UK Pay",
      type: ColumnFilterType.BOOLEAN,
    },
    {
      field: "govnotifyPersonalisation",
      headerName: "GOV.UK Notify",
      type: ColumnFilterType.BOOLEAN,
      customComponent: (params) => {
        return params.value?.helpEmail ? <Configured /> : <NotConfigured />;
      },
    },
    {
      field: "sendToEmailAddress",
      headerName: "Send to email",
      type: ColumnFilterType.BOOLEAN,
    },
    {
      field: "bopsSubmissionURL",
      headerName: "BOPS",
      type: ColumnFilterType.BOOLEAN,
    },
    {
      field: "powerAutomateEnabled",
      headerName: "Power automate",
      type: ColumnFilterType.BOOLEAN,
    },
    {
      field: "subdomain",
      headerName: "Subdomain",
      type: ColumnFilterType.BOOLEAN,
    },
    {
      field: "logo",
      headerName: "Logo",
      type: ColumnFilterType.BOOLEAN,
    },
    {
      field: "favicon",
      headerName: "Favicon",
      type: ColumnFilterType.BOOLEAN,
    },
    {
      field: "isTrial",
      headerName: "Trial account",
      type: ColumnFilterType.BOOLEAN,
    },
  ];

  return (
    <FixedHeightDashboardContainer bgColor="background.paper">
      <SettingsSection>
        <Typography variant="h2" component="h1" gutterBottom>
          Platform admin panel
        </Typography>
        <Typography variant="body1">
          {`This is an overview of each team's integrations and settings for the `}
          <Typography component="span" fontWeight={FONT_WEIGHT_SEMI_BOLD}>
            {import.meta.env.VITE_APP_ENV}
          </Typography>
          {` environment.`}
        </Typography>
      </SettingsSection>
      {loading ? (
        <DelayedLoadingIndicator />
      ) : (
        <DataTable rows={adminPanelData} columns={columns} />
      )}
    </FixedHeightDashboardContainer>
  );
};
