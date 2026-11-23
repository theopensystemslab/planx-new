import { ServerError } from "../../../errors/index.js";
import type { ValidatedRequestHandler } from "../../../shared/middleware/validate.js";
import type { InvoiceKind } from "../../stripe/webhook/vatInvoice/storage.js";
import type { submissionSchema } from "../submission/schema.js";
import { getInvoiceBySessionId, getSessionActiveInvoices } from "./service.js";

type DownloadInvoiceController = ValidatedRequestHandler<
  typeof submissionSchema,
  Buffer
>;

export const downloadCouncilInvoice: DownloadInvoiceController = async (
  _req,
  res,
  next,
) => {
  const { sessionId } = res.locals.parsedReq.params;

  try {
    const { pdf, invoiceNumber } = await getInvoiceBySessionId(
      sessionId,
      "council_invoice",
    );
    res.set("Content-Type", "application/pdf");
    res.set("Content-Disposition", `attachment; filename=${invoiceNumber}.pdf`);
    res.set("Content-Length", pdf.length.toString());
    res.status(200).send(pdf);
  } catch (error) {
    return next(
      new ServerError({
        message: `Failed to download council invoice for session ${sessionId}. ${error}`,
        cause: error,
      }),
    );
  }
};

export const downloadPayerInvoice: DownloadInvoiceController = async (
  _req,
  res,
  next,
) => {
  const { sessionId } = res.locals.parsedReq.params;

  try {
    const { pdf, invoiceNumber } = await getInvoiceBySessionId(
      sessionId,
      "payer_invoice",
    );
    res.set("Content-Type", "application/pdf");
    res.set("Content-Disposition", `attachment; filename=${invoiceNumber}.pdf`);
    res.set("Content-Length", pdf.length.toString());
    res.status(200).send(pdf);
  } catch (error) {
    return next(
      new ServerError({
        message: `Failed to download payer invoice for session ${sessionId}. ${error}`,
        cause: error,
      }),
    );
  }
};

type ActiveInvoiceController = ValidatedRequestHandler<
  typeof submissionSchema,
  Record<InvoiceKind, boolean>
>;

export const getActiveInvoices: ActiveInvoiceController = async (
  _req,
  res,
  next,
) => {
  const sessionId = res.locals.parsedReq.params.sessionId;

  try {
    const availability = await getSessionActiveInvoices(sessionId);
    res.status(200).json(availability);
  } catch (error) {
    return next(
      new ServerError({
        message: `Failed to check active invoices for session ${sessionId}. ${error}`,
        cause: error,
      }),
    );
  }
};
