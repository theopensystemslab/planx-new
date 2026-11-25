import z from "zod";

export const downloadInvoiceSchema = z.object({
  params: z.object({
    sessionId: z.uuid(),
    invoiceKind: z
      .enum(["council", "payer"])
      .transform((kind) => `${kind}_invoice` as const), // appending `_invoice` here because the InvoiceKind type is `council_invoice` or `payer_invoice`
  }),
});
