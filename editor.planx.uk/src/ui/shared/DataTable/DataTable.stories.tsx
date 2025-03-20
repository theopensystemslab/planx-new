// @ts-nocheck
import { Meta, StoryObj } from "@storybook/react";
import { getFlowNamesForFilter } from "pages/PlatformAdminPanel/utils";

import { DataTable } from "./DataTable";
import { mockTeams } from "./mockTeams";
import { ColumnFilterType } from "./types";

const meta = {
  title: "Design System/Atoms/Data table",
  component: DataTable,
} satisfies Meta<typeof DataTable>;

type Story = StoryObj<typeof meta>;

export default meta;

const liveFlowValueOptions = getFlowNamesForFilter(mockTeams);

export const Basic = {
  args: {
    rows: mockTeams,
    columns: [
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
        type: ColumnFilterType.ARRAY,
        columnOptions: {
          valueOptions: liveFlowValueOptions,
        },
      },
      {
        field: "planningDataEnabled",
        headerName: "Planning constraints",
        type: ColumnFilterType.BOOLEAN,
      },
      {
        field: "govpayEnabled",
        headerName: "GOV.UK Pay",
        type: ColumnFilterType.BOOLEAN,
      },
      {
        field: "logo",
        headerName: "Logo",
        type: ColumnFilterType.BOOLEAN,
      },
    ],
  },
} satisfies Story;
