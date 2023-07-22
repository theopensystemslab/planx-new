import Button from "@mui/material/Button";
import { Meta } from "@storybook/react";
import React from "react";

import ExternalPortalForm from "./Editor";

export default {
  title: "PlanX Components/ExternalPortal",
  component: ExternalPortalForm,
} satisfies Meta<typeof ExternalPortalForm>;

export const WithEditor = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          backgroundColor: "#f9f8f8",
          boxShadow: "10px 5px 5px grey",
          margin: "1em",
        }}
      >
        <ExternalPortalForm
          id="a"
          flowId="1"
          flows={[
            {
              id: "2",
              text: "council/article4",
            },
            {
              id: "3",
              text: "council/drawings",
            },
            {
              id: "4",
              text: "another-council/works-to-trees",
            },
          ]}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          form="modal"
          fullWidth
        >
          Update
        </Button>
      </div>
    </div>
  ),
};
