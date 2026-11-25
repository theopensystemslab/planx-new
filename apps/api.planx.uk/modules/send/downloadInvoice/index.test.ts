import supertest from "supertest";

import app from "../../../server.js";
import { queryMock } from "../../../tests/graphqlQueryMock.js";
import { authHeader } from "../../../tests/mockJWT.js";
import { getFileFromS3 } from "../../file/service/getFile.js";
import type { StoredInvoice } from "../../stripe/webhook/vatInvoice/storage.js";

vi.mock("../../file/service/getFile.js", () => ({
  getFileFromS3: vi.fn(),
}));

const SESSION_ID = "4a3f6f1d-3cb0-4328-b02b-907964bde727";
const PDF = Buffer.from("%PDF-test");

const STORED_PAYER_INVOICE: StoredInvoice = {
  id: "8f1c2d3e-0000-0000-0000-000000000000",
  kind: "payer_invoice",
  stripePaymentIntentId: "pi_test_123",
  sessionId: SESSION_ID,
  flowId: "b2c3d4e5-0000-0000-0000-000000000000",
  teamId: 1,
  invoiceNumber: "ABC-2026-INV-00001",
  issuedAt: "2026-10-07T12:00:00+00:00",
  net: 12000,
  vat: 2400,
  total: 14400,
  fileKey: "lpa/pi_test_123/payer_invoice.pdf",
};

const STORED_COUNCIL_INVOICE: StoredInvoice = {
  ...STORED_PAYER_INVOICE,
  id: "9f1c2d3e-0000-0000-0000-000000000000",
  kind: "council_invoice",
  invoiceNumber: "OSL-2026-INV-ABC-00001",
  fileKey: "lpa/pi_test_123/council_invoice.pdf",
};

const mockGetInvoiceBySessionId = (invoice: StoredInvoice | null) =>
  queryMock.mockQuery({
    name: "GetInvoiceBySessionId",
    matchOnVariables: false,
    data: { invoices: invoice ? [invoice] : [] },
  });

const mockGetActiveInvoices = (invoices: Partial<StoredInvoice>[]) =>
  queryMock.mockQuery({
    name: "GetActiveInvoices",
    matchOnVariables: false,
    data: { invoices },
  });

afterEach(() => {
  vi.clearAllMocks();
});

describe("getting active invoices", () => {
  it("returns true for kinds with a stored file", async () => {
    mockGetActiveInvoices([
      { kind: "payer_invoice", fileKey: "lpa/pi_test_123/payer_invoice.pdf" },
    ]);

    await supertest(app)
      .get(`/submission/${SESSION_ID}/active-invoices`)
      .set(authHeader({ role: "teamEditor" }))
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          payer_invoice: true,
          council_invoice: false,
        });
      });
  });

  it("returns false for both kinds when no invoices exist", async () => {
    mockGetActiveInvoices([]);

    await supertest(app)
      .get(`/submission/${SESSION_ID}/active-invoices`)
      .set(authHeader({ role: "teamEditor" }))
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          payer_invoice: false,
          council_invoice: false,
        });
      });
  });

  it("does not return active invoices without auth", async () => {
    await supertest(app)
      .get(`/submission/${SESSION_ID}/active-invoices`)
      .expect(401);
  });
});

describe("downloading the council invoice", () => {
  it("downloads the PDF with the correct name", async () => {
    mockGetInvoiceBySessionId(STORED_COUNCIL_INVOICE);
    vi.mocked(getFileFromS3).mockResolvedValue({
      outcome: "ok",
      body: PDF,
      isPrivate: true,
      filename: "council_invoice.pdf",
      headers: {} as never,
    });

    await supertest(app)
      .get(`/submission/${SESSION_ID}/invoice/council`)
      .set(authHeader({ role: "teamEditor" }))
      .expect(200)
      .then((res) => {
        expect(res.headers["content-type"]).toBe("application/pdf");
        expect(res.headers["content-disposition"]).toBe(
          `attachment; filename=${STORED_COUNCIL_INVOICE.invoiceNumber}.pdf`,
        );
        expect(res.body).toBeInstanceOf(Buffer);
      });
  });

  it("errors when no council invoice exists for the session", async () => {
    mockGetInvoiceBySessionId(null);

    await supertest(app)
      .get(`/submission/${SESSION_ID}/invoice/council`)
      .set(authHeader({ role: "teamEditor" }))
      .expect(404)
      .then((res) => {
        expect(res.body.error).toMatch(/No stored council_invoice found/);
      });
  });

  it("does not download without auth", async () => {
    await supertest(app)
      .get(`/submission/${SESSION_ID}/invoice/council`)
      .expect(401);
  });

  it("returns a 500 when the PDF cannot be fetched from S3", async () => {
    mockGetInvoiceBySessionId(STORED_COUNCIL_INVOICE);
    vi.mocked(getFileFromS3).mockResolvedValue({
      outcome: "not-found",
    });

    await supertest(app)
      .get(`/submission/${SESSION_ID}/invoice/council`)
      .set(authHeader({ role: "teamEditor" }))
      .expect(500)
      .then((res) => {
        expect(res.body.error).toMatch(/Failed to download council_invoice/);
      });
  });
});

describe("downloading the payer invoice", () => {
  it("downloads the PDF with the correct name", async () => {
    mockGetInvoiceBySessionId(STORED_PAYER_INVOICE);
    vi.mocked(getFileFromS3).mockResolvedValue({
      outcome: "ok",
      body: PDF,
      isPrivate: true,
      filename: "payer_invoice.pdf",
      headers: {} as never,
    });

    await supertest(app)
      .get(`/submission/${SESSION_ID}/invoice/payer`)
      .set(authHeader({ role: "teamEditor" }))
      .expect(200)
      .then((res) => {
        expect(res.headers["content-type"]).toBe("application/pdf");
        expect(res.headers["content-disposition"]).toBe(
          `attachment; filename=${STORED_PAYER_INVOICE.invoiceNumber}.pdf`,
        );
        expect(res.body).toBeInstanceOf(Buffer);
      });
  });

  it("errors when no payer invoice exists for the session", async () => {
    mockGetInvoiceBySessionId(null);

    await supertest(app)
      .get(`/submission/${SESSION_ID}/invoice/payer`)
      .set(authHeader({ role: "teamEditor" }))
      .expect(404)
      .then((res) => {
        expect(res.body.error).toMatch(/No stored payer_invoice found/);
      });
  });

  it("does not download without auth", async () => {
    await supertest(app)
      .get(`/submission/${SESSION_ID}/invoice/payer`)
      .expect(401);
  });

  it("returns a 500 when the PDF cannot be fetched from S3", async () => {
    mockGetInvoiceBySessionId(STORED_PAYER_INVOICE);
    vi.mocked(getFileFromS3).mockResolvedValue({
      outcome: "not-found",
    });

    await supertest(app)
      .get(`/submission/${SESSION_ID}/invoice/payer`)
      .set(authHeader({ role: "teamEditor" }))
      .expect(500)
      .then((res) => {
        expect(res.body.error).toMatch(/Failed to download payer_invoice/);
      });
  });
});
