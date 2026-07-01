import BarChartIcon from "@mui/icons-material/BarChart";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { ActivityItem } from "hooks/data/useActivityData";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import { EmptyState } from "ui/editor/EmptyState";

const ServiceList = styled(Box)(({ theme }) => ({
  overflowY: "auto",
  flex: 1,
  padding: theme.spacing(0, 1.5),
}));

const ServiceRow = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.3, 0),
  "&:last-child": {
    borderBottom: "none",
  },
}));

const ServiceMeta = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  marginBottom: 6,
});

const ProgressTrack = styled(Box)(({ theme }) => ({
  height: 6,
  borderRadius: 2,
  backgroundColor: theme.palette.secondary.dark,
  overflow: "hidden",
}));

const ProgressFill = styled(Box)(({ theme }) => ({
  height: "100%",
  backgroundColor: theme.palette.primary.main,
  borderRadius: 50,
}));

export default function ServiceListWithCount({
  items,
}: {
  items: ActivityItem[];
}) {
  const activeItems = items.filter((item) => item.count > 0);
  const maxCount = activeItems[0]?.count ?? 1;

  if (activeItems.length === 0) {
    return (
      <ServiceList>
        <EmptyState
          size="small"
          title="No activity to show"
          icon={<BarChartIcon />}
        />
      </ServiceList>
    );
  }

  return (
    <ServiceList>
      {activeItems.map((item) => (
        <ServiceRow key={item.name}>
          <ServiceMeta>
            <Typography
              variant="body3"
              sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
            >
              {item.name}
            </Typography>
            <Typography
              variant="body3"
              sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
            >
              {item.count}
            </Typography>
          </ServiceMeta>
          <ProgressTrack>
            <ProgressFill sx={{ width: `${(item.count / maxCount) * 100}%` }} />
          </ProgressTrack>
        </ServiceRow>
      ))}
    </ServiceList>
  );
}
