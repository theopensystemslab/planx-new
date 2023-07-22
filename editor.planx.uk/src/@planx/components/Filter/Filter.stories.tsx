import Button from "@mui/material/Button";
import { Meta } from "@storybook/react";
import React from "react";

import Filter from "./Editor";

export default {
  title: "PlanX Components/Filter",
  component: Filter,
} satisfies Meta<typeof Filter>;

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
        <Filter handleSubmit={() => {}} />
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
