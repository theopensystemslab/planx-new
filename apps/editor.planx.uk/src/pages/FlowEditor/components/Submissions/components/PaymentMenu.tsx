import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import PaymentIcon from "@mui/icons-material/Payment";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useState } from "react";

import type { Submission } from "../types";
import { InitiateRefundDialog } from "./InitiateRefundDialog";

type Props = {
  sessionId: string;
  paymentEvent: Submission;
};

/**
 * Groups payment-related actions behind a single "Payment" dropdown
 */
export const PaymentMenu = ({ sessionId, paymentEvent }: Props) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const isMenuOpen = Boolean(anchorEl);

  const handleCloseMenu = () => setAnchorEl(null);

  /**
   * TODO: Wire up refund workflow
   */
  const handleInitiateRefund = () => {
    console.log("Initiate refund", { sessionId, paymentEvent });
    setIsRefundDialogOpen(true);
    handleCloseMenu();
  };

  /**
   * TODO: Wire up download invoice workflow
   */
  const handleDownloadInvoice = () => {
    console.log("Download invoice", { sessionId, paymentEvent });
    handleCloseMenu();
  };

  return (
    <>
      <Button
        color="primary"
        variant="contained"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        startIcon={<PaymentIcon />}
        endIcon={<KeyboardArrowDown />}
        aria-haspopup="menu"
        aria-controls={isMenuOpen ? "payment-menu" : undefined}
        aria-expanded={isMenuOpen ? "true" : undefined}
      >
        Payment
      </Button>
      <Menu
        id="payment-menu"
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleInitiateRefund}>Initiate refund</MenuItem>
        <MenuItem onClick={handleDownloadInvoice}>Download invoice</MenuItem>
      </Menu>
      <InitiateRefundDialog
        open={isRefundDialogOpen}
        onClose={() => setIsRefundDialogOpen(false)}
      />
    </>
  );
};
