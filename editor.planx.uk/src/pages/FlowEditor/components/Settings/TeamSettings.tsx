import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import React from "react";
import { FeaturePlaceholder } from "ui/FeaturePlaceholder";
import InputGroup from "ui/InputGroup";
import InputRow from "ui/InputRow";
import InputRowItem from "ui/InputRowItem";
import OptionButton from "ui/OptionButton";
import SelectInput from "ui/SelectInput";

const Team: React.FC = () => {
  const formik = useFormik({
    initialValues: {},
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
    },
    validate: () => {},
  });
  return (
    <form onSubmit={formik.handleSubmit}>
      <Box pb={3} borderBottom={1}>
        <Typography variant="h2" component="h3" gutterBottom>
          <strong>Team</strong>
        </Typography>
        <Typography variant="body1">
          Manage who has permission to edit this service
        </Typography>
      </Box>
      <Box py={4} borderBottom={1}>
        <FeaturePlaceholder title="Feature in development" />
      </Box>
      <Box py={3}>
        <Typography variant="h2" component="h3" gutterBottom>
          <strong>Sharing</strong>
        </Typography>
        <Typography variant="body1" gutterBottom>
          Allow other teams on Plan✕ to find and use your service pattern
        </Typography>
        <Box pt={2}>
          <InputGroup>
            <InputRow>
              <OptionButton selected>Share</OptionButton>
              <InputRowItem width="60%">
                <SelectInput>
                  <MenuItem>Open Government Licence</MenuItem>
                </SelectInput>
              </InputRowItem>
            </InputRow>
          </InputGroup>
        </Box>
      </Box>
    </form>
  );
};
export default Team;
