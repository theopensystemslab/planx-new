import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import React from "react";

const DataManagerSettings = () => {
  const formik = useFormik({
    initialValues: {},
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
    },
    validate: () => {},
  });
  return (
    <form onSubmit={formik.handleSubmit}>
      <Box pb={3}>
        <Typography variant="h2" component="h3" gutterBottom>
          <strong>Data Manager</strong>
        </Typography>
        <Typography variant="body1">
          Manage the data that your service uses and makes available via its API
        </Typography>
      </Box>
    </form>
  );
};
export default DataManagerSettings;
