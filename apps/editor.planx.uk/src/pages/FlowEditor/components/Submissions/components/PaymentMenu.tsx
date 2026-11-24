import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import PaymentIcon from "@mui/icons-material/Payment";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useQuery } from "@tanstack/react-query";
import { getActiveInvoices } from "lib/api/send/requests";
import type { InvoiceKind } from "lib/api/send/types";
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

  const { data: activeInvoices } = useQuery({
    queryKey: ["activeInvoices", sessionId],
    queryFn: () => getActiveInvoices(sessionId),
  });

  const invoiceUrl = `${import.meta.env.VITE_APP_API_URL}/submission/${sessionId}/invoice`;

  const handleCloseMenu = () => setAnchorEl(null);

  /**
   * TODO: Wire up refund workflow
   */
  const handleInitiateRefund = () => {
    console.log("Initiate refund", { sessionId, paymentEvent });
    setIsRefundDialogOpen(true);
    handleCloseMenu();
  };

  const handleDownloadInvoice = (kind: InvoiceKind) => {
    const relevantInvoiceUrl = invoiceUrl.concat(
      `/${kind === "payer_invoice" ? "payer" : "council"}`,
    );
    window.open(relevantInvoiceUrl, "_blank");
    handleCloseMenu();
  };

  return (
    <>
      <Button
        color="secondary"
        variant="contained"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        startIcon={<PaymentIcon />}
        endIcon={<KeyboardArrowDown />}
        aria-haspopup="menu"
        aria-controls={isMenuOpen ? "payment-menu" : undefined}
        aria-expanded={isMenuOpen ? "true" : undefined}
        data-testid="payment-menu-button"
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
        <MenuItem
          onClick={() => handleDownloadInvoice("council_invoice")}
          disabled={!activeInvoices?.council_invoice}
        >
          Download council invoice
        </MenuItem>
        <MenuItem
          onClick={() => handleDownloadInvoice("payer_invoice")}
          disabled={!activeInvoices?.payer_invoice}
        >
          Download payer invoice
        </MenuItem>
      </Menu>
      <InitiateRefundDialog
        open={isRefundDialogOpen}
        onClose={() => setIsRefundDialogOpen(false)}
      />
    </>
  );
};
