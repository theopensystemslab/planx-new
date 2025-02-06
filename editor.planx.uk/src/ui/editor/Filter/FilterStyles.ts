import Accordion, { accordionClasses } from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary, {
  accordionSummaryClasses,
} from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { styled } from "@mui/material/styles";

export const FiltersContainer = styled(Accordion)(({ theme }) => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  margin: theme.spacing(1, 0, 3),
  border: `1px solid ${theme.palette.border.main}`,
  [`&.${accordionClasses.root}.Mui-expanded`]: {
    margin: theme.spacing(1, 0, 3),
  },
  [`& .${accordionSummaryClasses.root} > div`]: {
    margin: "0",
  },
}));

export const FiltersHeader = styled(AccordionSummary)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(1.75, 2),
  gap: theme.spacing(3),
  background: theme.palette.background.midGray,
  "&:hover": {
    background: theme.palette.background.midGray,
  },
  "& .MuiAccordionSummary-expandIconWrapper": {
    display: "none",
  },
}));

export const FiltersToggle = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
  minWidth: "160px",
  minHeight: "32px",
}));

export const StyledChip = styled(Chip)(({ theme }) => ({
  background: theme.palette.common.white,
  cursor: "default",
  textTransform: "capitalize",
  "& > svg": {
    fill: theme.palette.text.secondary,
  },
  "&:hover": {
    background: theme.palette.common.white,
    "& > svg": {
      fill: theme.palette.text.primary,
    },
  },
}));

export const FiltersBody = styled(AccordionDetails)(({ theme }) => ({
  background: theme.palette.background.midGray,
  padding: 0,
}));

export const FiltersContent = styled(Box)(({ theme }) => ({
  borderTop: `1px solid ${theme.palette.border.main}`,
  padding: theme.spacing(2.5, 2.5, 2, 2.5),
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
}));

export const FiltersFooter = styled(Box)(({ theme }) => ({
  borderTop: `1px solid ${theme.palette.border.main}`,
  padding: theme.spacing(1.5, 2),
}));
