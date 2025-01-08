import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";
import ChecklistItem from "ui/shared/ChecklistItem/ChecklistItem";

const FiltersContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  background: "#eee",
  margin: theme.spacing(1, 0, 3),
}));

const FiltersHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  padding: theme.spacing(2),
  gap: theme.spacing(1),
}));

const FiltersBody = styled(Box)(({ theme }) => ({}));

const FiltersContent = styled(Box)(({ theme }) => ({
  borderTop: `1px solid ${theme.palette.border.main}`,
  padding: theme.spacing(1.5, 2.5),
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
}));

const FiltersColumn = styled(Box)(({ theme }) => ({
  flexBasis: "20%",
}));

const FiltersFooter = styled(Box)(({ theme }) => ({
  borderTop: `1px solid ${theme.palette.border.main}`,
  padding: theme.spacing(1.5, 2),
}));

const Filters: React.FC = () => {
  return (
    <FiltersContainer>
      <FiltersHeader>
        <KeyboardArrowUpIcon />
        <Typography variant="h4">Hide filters</Typography>
      </FiltersHeader>
      <FiltersBody>
        <FiltersContent>
          <FiltersColumn>
            <Typography variant="h5">Online status</Typography>
            <ChecklistItem
              onChange={() => {}}
              label={"Online"}
              checked={false}
              variant="compact"
            />
            <ChecklistItem
              onChange={() => {}}
              label={"Offline"}
              checked={false}
              variant="compact"
            />
          </FiltersColumn>
          <FiltersColumn>
            <Typography variant="h5">Application type</Typography>
            <ChecklistItem
              onChange={() => {}}
              label={"Submission"}
              checked={false}
              variant="compact"
            />
            <ChecklistItem
              onChange={() => {}}
              label={"Guidance"}
              checked={false}
              variant="compact"
            />
          </FiltersColumn>
          <FiltersColumn>
            <Typography variant="h5">Service type</Typography>
            <ChecklistItem
              onChange={() => {}}
              label={"Statutory"}
              checked={false}
              variant="compact"
            />
            <ChecklistItem
              onChange={() => {}}
              label={"Discretionary"}
              checked={false}
              variant="compact"
            />
          </FiltersColumn>
        </FiltersContent>
        <FiltersFooter>
          <Button variant="contained" color="primary">
            Apply filters
          </Button>
        </FiltersFooter>
      </FiltersBody>
    </FiltersContainer>
  );
};

export default Filters;
