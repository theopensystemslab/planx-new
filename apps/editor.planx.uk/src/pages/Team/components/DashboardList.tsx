import { styled } from "@mui/material/styles";

export const DashboardList = styled("ul")(({ theme }) => ({
  padding: theme.spacing(2, 0, 3),
  margin: 0,
  gap: theme.spacing(2),
  display: "grid",
  gridAutoRows: "1fr",
  gridTemplateColumns: "repeat(1, 1fr)",
  [theme.breakpoints.up("md")]: {
    gridTemplateColumns: "repeat(2, 1fr)",
  },
  [theme.breakpoints.up("lg")]: {
    gridTemplateColumns: "repeat(3, 1fr)",
  },
}));
