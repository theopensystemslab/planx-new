import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import Box from "@mui/material/Box";
import ListItemButton from "@mui/material/ListItemButton";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useNavigate, useParams } from "@tanstack/react-router";
import type { FlowNote } from "hooks/data/useFlowNotes";
import type { SearchResult } from "hooks/useSearch";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

import { Headline } from "../Headline";

const Root = styled(ListItemButton)(({ theme }) => ({
  border: `1px solid ${theme.palette.text.primary}`,
  display: "block",
  maxWidth: "100%",
  padding: 0,
  borderWidth: 2,
}));

export const NoteResultCard: React.FC<{ result: SearchResult<FlowNote> }> = ({
  result,
}) => {
  const navigate = useNavigate();
  const { team, flow } = useParams({
    from: "/_authenticated/app/$team/$flow",
  });

  const handleClick = () =>
    navigate({
      to: "/app/$team/$flow/note/$id/edit",
      params: { team, flow, id: result.item.positionId },
    });

  return (
    <Root onClick={handleClick} disableRipple>
      <Box sx={{ p: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <StickyNote2Icon sx={{ fontSize: 18 }} />
          <Typography
            variant="body2"
            sx={{ ml: 1, fontSize: 14, fontWeight: FONT_WEIGHT_SEMI_BOLD }}
          >
            Note
          </Typography>
        </Box>
        <Box sx={{ mt: 1 }}>
          <Headline
            text={result.item.text}
            matchIndices={result.matchIndices!}
          />
        </Box>
      </Box>
    </Root>
  );
};
