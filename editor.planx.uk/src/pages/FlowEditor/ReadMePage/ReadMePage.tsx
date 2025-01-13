import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import React from "react";
import InputGroup from "ui/editor/InputGroup";
import InputLegend from "ui/editor/InputLegend";
import SettingsDescription from "ui/editor/SettingsDescription";
import SettingsSection from "ui/editor/SettingsSection";
import Input from "ui/shared/Input/Input";

interface ReadMePageProps {
  flowSlug: string;
  teamSlug: string;
}

export const ReadMePage: React.FC<ReadMePageProps> = ({
  flowSlug,
  teamSlug,
}) => {
  return (
    <Container maxWidth="contentWrap">
      <SettingsSection>
        <Typography variant="h2" component="h3" gutterBottom>
          About this Service
        </Typography>
        <Typography variant="body1">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. {flowSlug}{" "}
          {teamSlug}
        </Typography>
        <Box display={"flex"} justifyContent={"space-between"} width={300}>
          <Chip label="Online" color="success" />
          <Chip label="Submission" color="primary" />
          <Chip label="Discretionary" color="info" />
        </Box>
      </SettingsSection>
      <SettingsSection>
        <form onSubmit={() => {}}>
          <InputGroup flowSpacing>
            <InputLegend>Service Description</InputLegend>
            <SettingsDescription>
              <>
                A short blurb on what this service is, how it should be used,
                and if there are any dependencies related to this service.
              </>
            </SettingsDescription>
            <Input
              multiline
              name="description"
              placeholder="Description"
              onChange={() => {}}
              value={""}
              id="description"
            />
          </InputGroup>
          <InputGroup flowSpacing>
            <InputLegend>What does this service do?</InputLegend>
            <SettingsDescription>
              <>For example, what does the service include?</>
            </SettingsDescription>
            <Input
              multiline
              name="description"
              placeholder="The service..."
              onChange={() => {}}
              value={""}
              id="description"
            />
          </InputGroup>
          <InputGroup flowSpacing>
            <InputLegend>Limitations of the Service</InputLegend>
            <SettingsDescription>
              <>What does this flow not include?</>
            </SettingsDescription>
            <Input
              multiline
              name="description"
              placeholder="Limitations"
              onChange={() => {}}
              value={""}
              id="description"
            />
          </InputGroup>

          <Box>
            <Button type="submit" variant="contained">
              Save
            </Button>
            <Button
              onClick={() => {}}
              type="reset"
              variant="contained"
              color="secondary"
              sx={{ ml: 1.5 }}
            >
              Reset changes
            </Button>
          </Box>
        </form>
      </SettingsSection>
    </Container>
  );
};
