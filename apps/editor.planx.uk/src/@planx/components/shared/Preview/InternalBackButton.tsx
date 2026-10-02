import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { IconArrowLeft } from "@tabler/icons-react";
import { BackButton } from "pages/Preview/Questions";
import { Icon } from "ui/icons/Icon";

/**
 * A presentation-only back button for in-component navigation
 *
 * Mimics the global `BackButton` UI but accepts a `handleBack` prop
 * to control local component state (steps) rather than node-by-node navigation
 */
const InternalBackButton: React.FC<{ handleBack: () => void }> = ({
  handleBack,
}) => (
  <Box
    sx={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      zIndex: "2000",
    }}
  >
    <Container maxWidth="contentWrap">
      <BackButton onClick={handleBack} hidden={false} variant="link">
        <Icon icon={IconArrowLeft} fontSize="small" />
        Back
      </BackButton>
    </Container>
  </Box>
);

export default InternalBackButton;
