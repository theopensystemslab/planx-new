import { queryMock } from "../../../../tests/graphqlQueryMock.js";
import { getFileFromS3 } from "../../../file/service/getFile.js";
import { uploadPrivateFile } from "../../../file/service/uploadFile.js";
import type { StoredInvoice } from "./storage.js";
import { getInvoicePdf, getStoredInvoice, storeInvoice } from "./storage.js";

vi.mock("../../../file/service/uploadFile.js", () => ({
  uploadPrivateFile: vi.fn(),
}));

vi.mock("../../../file/service/getFile.js", () => ({
  getFileFromS3: vi.fn(),
}));

const PDF = Buffer.from("%PDF-test");
const PAYMENT_INTENT_ID = "pi_test_123";

const STORED_INVOICE: StoredInvoice = {
  id: "8f1c2d3e-0000-0000-0000-000000000000",
  kind: "council_invoice",
  stripePaymentIntentId: PAYMENT_INTENT_ID,
  sessionId: "a1b2c3d4-0000-0000-0000-000000000000",
  flowId: "b2c3d4e5-0000-0000-0000-000000000000",
  teamId: 1,
  invoiceNumber: "INV-123",
  issuedAt: "2026-10-07T12:00:00+00:00",
  net: 10000,
  vat: 0,
  total: 10000,
  fileKey: `invoices/${PAYMENT_INTENT_ID}/council_invoice.pdf`,
};

const { id: _id, fileKey: _fileKey, ...storeArgs } = STORED_INVOICE;
const STORE_ARGS = {
  ...storeArgs,
  issuedAt: new Date("2026-10-07T12:00:00Z"),
  pdf: PDF,
};

const mockGetStoredInvoice = (invoice: StoredInvoice | null) =>
  queryMock.mockQuery({
    name: "GetStoredInvoice",
    matchOnVariables: false,
    data: { invoices: invoice ? [invoice] : [] },
  });

const mockInsertPaymentInvoice = (stored: StoredInvoice | null) =>
  queryMock.mockQuery({
    name: "InsertPaymentInvoice",
    matchOnVariables: false,
    data: { stored },
  });

const getCall = (name: string) =>
  queryMock.getCalls().find((call) => call.id === name);

afterEach(() => {
  vi.clearAllMocks();
});

describe("getStoredInvoice", () => {
  it("returns the invoice of the given kind for a PaymentIntent", async () => {
    mockGetStoredInvoice(STORED_INVOICE);

    await expect(
      getStoredInvoice(PAYMENT_INTENT_ID, "council_invoice"),
    ).resolves.toEqual(STORED_INVOICE);

    expect(getCall("GetStoredInvoice")?.variables).toEqual({
      stripePaymentIntentId: PAYMENT_INTENT_ID,
      kind: "council_invoice",
    });
  });

  it("returns null when the invoice has not been stored", async () => {
    mockGetStoredInvoice(null);

    await expect(
      getStoredInvoice(PAYMENT_INTENT_ID, "council_invoice"),
    ).resolves.toBeNull();
  });
});

describe("storeInvoice", () => {
  it("uploads the PDF to S3 under the invoices prefix, exempt from malware scanning", async () => {
    mockInsertPaymentInvoice(STORED_INVOICE);

    await storeInvoice(STORE_ARGS);

    expect(uploadPrivateFile).toHaveBeenCalledWith(
      expect.objectContaining({ buffer: PDF, mimetype: "application/pdf" }),
      "council_invoice.pdf",
      `invoices/${PAYMENT_INTENT_ID}`,
      { dangerouslySkipMalwareScan: true },
    );
  });

  it("records the invoice and returns it", async () => {
    mockInsertPaymentInvoice(STORED_INVOICE);

    await expect(storeInvoice(STORE_ARGS)).resolves.toEqual(STORED_INVOICE);

    expect(getCall("InsertPaymentInvoice")?.variables).toEqual({
      invoice: {
        kind: "council_invoice",
        stripe_payment_intent_id: PAYMENT_INTENT_ID,
        session_id: STORED_INVOICE.sessionId,
        flow_id: STORED_INVOICE.flowId,
        team_id: 1,
        invoice_number: "INV-123",
        issued_at: "2026-10-07T12:00:00.000Z",
        net: 10000,
        vat: 0,
        total: 10000,
        file_key: `invoices/${PAYMENT_INTENT_ID}/council_invoice.pdf`,
      },
    });
  });

  it("returns the existing invoice when it has already been recorded", async () => {
    mockInsertPaymentInvoice(null);
    mockGetStoredInvoice(STORED_INVOICE);

    await expect(storeInvoice(STORE_ARGS)).resolves.toEqual(STORED_INVOICE);
  });

  it("throws when the invoice can be neither recorded nor found", async () => {
    mockInsertPaymentInvoice(null);
    mockGetStoredInvoice(null);

    await expect(storeInvoice(STORE_ARGS)).rejects.toThrow(
      `Could not record council_invoice for PaymentIntent ${PAYMENT_INTENT_ID}`,
    );
  });

  it("does not record the invoice when the upload fails", async () => {
    vi.mocked(uploadPrivateFile).mockRejectedValueOnce(new Error("S3 down"));
    mockInsertPaymentInvoice(STORED_INVOICE);

    await expect(storeInvoice(STORE_ARGS)).rejects.toThrow("S3 down");

    expect(getCall("InsertPaymentInvoice")).toBeUndefined();
  });
});

describe("getInvoicePdf", () => {
  it("returns the PDF from S3", async () => {
    vi.mocked(getFileFromS3).mockResolvedValue({
      outcome: "ok",
      body: PDF,
      isPrivate: true,
      filename: "council_invoice.pdf",
      headers: {} as never,
    });

    await expect(getInvoicePdf(STORED_INVOICE.fileKey)).resolves.toEqual(PDF);
  });

  it("throws when the PDF cannot be fetched", async () => {
    vi.mocked(getFileFromS3).mockResolvedValue({ outcome: "not-found" });

    await expect(getInvoicePdf(STORED_INVOICE.fileKey)).rejects.toThrow(
      `Could not fetch invoice ${STORED_INVOICE.fileKey} from S3 (not-found)`,
    );
  });
});
