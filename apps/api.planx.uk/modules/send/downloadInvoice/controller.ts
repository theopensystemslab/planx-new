import { ServerError } from "../../../errors/index.js";
import type { ValidatedRequestHandler } from "../../../shared/middleware/validate.js";
import type { InvoiceKind } from "../../stripe/webhook/vatInvoice/storage.js";
import { getInvoiceBySessionId, getSessionActiveInvoices } from "./service.js";
import type { downloadInvoiceSchema } from "./types.js";

type DownloadInvoiceController = ValidatedRequestHandler<
  typeof downloadInvoiceSchema,
  Buffer
>;

export const downloadInvoice: DownloadInvoiceController = async (
  _req,
  res,
  next,
) => {
  const { sessionId, invoiceKind } = res.locals.parsedReq.params;

  try {
    const { pdf, invoiceNumber } = await getInvoiceBySessionId(
      sessionId,
      invoiceKind,
    );
    res.set("Content-Type", "application/pdf");
    res.set("Content-Disposition", `attachment; filename=${invoiceNumber}.pdf`);
    res.set("Content-Length", pdf.length.toString());
    res.status(200).send(pdf);
  } catch (error) {
    if (error instanceof ServerError) {
      return next(error);
    }

    return next(
      new ServerError({
        message: `Failed to download ${invoiceKind} for session ${sessionId}. ${error}`,
        cause: error,
      }),
    );
  }
};

type ActiveInvoiceController = ValidatedRequestHandler<
  typeof downloadInvoiceSchema,
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
