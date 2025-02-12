import { Meta, StoryObj } from "@storybook/react";

import { DataTable } from "./DataTable";
import { mockTeams } from "./mockTeams";
import { ColumnType } from "./types";

const meta = {
  title: "Design System/Atoms/Data table",
  component: DataTable,
} satisfies Meta<typeof DataTable>;

type Story = StoryObj<typeof meta>;

export default meta;

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
        type: ColumnType.ARRAY,
      },
      {
        field: "planningDataEnabled",
        headerName: "Planning constraints",
        type: ColumnType.BOOLEAN,
      },
      {
        field: "govpayEnabled",
        headerName: "GOV.UK Pay",
        type: ColumnType.BOOLEAN,
      },
      {
        field: "logo",
        headerName: "Logo",
        type: ColumnType.BOOLEAN,
      },
    ],
  },
} satisfies Story;
