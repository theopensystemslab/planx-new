import Check from "@mui/icons-material/Check";
import Error from "@mui/icons-material/Error";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Image from "@tiptap/extension-image";
import {
  NodeViewWrapper,
  NodeViewWrapperProps,
  ReactNodeViewRenderer,
} from "@tiptap/react";
import React from "react";

const StyledNodeViewWrapper = styled(NodeViewWrapper, {
  shouldForwardProp: (prop) => prop !== "selected",
})<NodeViewWrapperProps & { selected: boolean }>(({ selected, theme }) => ({
  outline: selected ? `3px solid ${theme.palette.action.focus}` : undefined,
  position: "relative",
}));

const StyledImg = styled("img")(() => ({
  maxWidth: "100%",
  display: "block",
  width: "fit-content",
}));

const AltTextIndicator = styled(Box)(({ theme }) => ({
  fontSize: "0.8em",
  position: "absolute",
  bottom: theme.spacing(1),
  left: theme.spacing(1),
  maxWidth: `calc(100% - ${theme.spacing(2)})`,
  padding: "0 0.5em",
  border: "1px solid #242424",
  backgroundColor: "rgba(255, 255, 255, 0.8)",
  display: "inline-flex",
  alignItems: "center",
  overflow: "hidden",
  gap: "0.25em,",
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  flex: "1 1 auto",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  marginRight: theme.spacing(1),
}));

const ImageNode: React.FC<NodeViewWrapperProps> = ({
  selected,
  node,
  updateAttributes,
}) => {
  const { src, alt } = node.attrs;

  const onEditAlt = () => {
    const newAlt = prompt("Set alt text:", alt || "");
    updateAttributes({ alt: newAlt });
  };

  return (
    <StyledNodeViewWrapper selected={selected}>
      <StyledImg src={src} alt={alt} />
      <AltTextIndicator>
        <IconButton size="small" sx={{ flex: "0 0 auto" }}>
          {alt ? <Check /> : <Error />}
        </IconButton>
        <StyledTypography variant="body2">
          {alt ? `Alt text: ${alt}` : "Alt text missing"}
        </StyledTypography>
        <Link
          component={"button"}
          sx={{
            flex: "0 0 auto",
          }}
          type="button"
          onClick={onEditAlt}
        >
          Edit
        </Link>
      </AltTextIndicator>
    </StyledNodeViewWrapper>
  );
};

export default Image.extend({
  addNodeView() {
    return ReactNodeViewRenderer(ImageNode);
  },
});
