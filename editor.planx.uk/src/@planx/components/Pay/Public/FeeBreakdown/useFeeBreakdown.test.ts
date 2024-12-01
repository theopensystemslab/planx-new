import { logger } from "airbrake";
import { useStore } from "pages/FlowEditor/lib/store";
import { vi } from "vitest";

import { useFeeBreakdown } from "./useFeeBreakdown";

vi.mock("pages/FlowEditor/lib/store", () => ({
  useStore: vi.fn(),
}));

vi.mock("airbrake", () => ({
  logger: {
    notify: vi.fn(),
  },
}));

describe("useFeeBreakdown() hook", () => {
  describe("valid data", () => {
    it("returns a fee breakdown for number inputs", () => {
      const mockPassportData = {
        "application.fee.calculated": 1000,
        "application.fee.payable": 800,
        "application.fee.payable.vat": 160,
        "some.other.fields": ["abc", "xyz"],
      };

      vi.mocked(useStore).mockReturnValue([mockPassportData, "test-session"]);

      const result = useFeeBreakdown();

      expect(result).toEqual({
        amount: {
          applicationFee: 1000,
          total: 800,
          reduction: 200,
          vat: 160,
        },
        exemptions: [],
        reductions: [],
      });
    });

    it("returns a fee breakdown for number tuple inputs", () => {
      const mockPassportData = {
        "application.fee.calculated": [1000],
        "application.fee.payable": [800],
        "application.fee.payable.vat": [160],
        "some.other.fields": ["abc", "xyz"],
      };

      vi.mocked(useStore).mockReturnValue([mockPassportData, "test-session"]);

      const result = useFeeBreakdown();

      expect(result).toEqual({
        amount: {
          applicationFee: 1000,
          total: 800,
          reduction: 200,
          vat: 160,
        },
        exemptions: [],
        reductions: [],
      });
    });

    it("parses 'true' reduction values to a list of keys", () => {
      const mockPassportData = {
        "application.fee.calculated": 1000,
        "application.fee.payable": 800,
        "application.fee.payable.vat": 160,
        "application.fee.reduction.reasonOne": ["true"],
        "application.fee.reduction.reasonTwo": ["true"],
        "some.other.fields": ["abc", "xyz"],
      };

      vi.mocked(useStore).mockReturnValue([mockPassportData, "test-session"]);

      const result = useFeeBreakdown();

      expect(result?.reductions).toHaveLength(2);
      expect(result?.reductions).toEqual(
        expect.arrayContaining(["reasonOne", "reasonTwo"])
      );
    });

    it("does not parse 'false' reduction values to a list of keys", () => {
      const mockPassportData = {
        "application.fee.calculated": 1000,
        "application.fee.payable": 800,
        "application.fee.payable.vat": 160,
        "application.fee.reduction.reasonOne": ["false"],
        "application.fee.reduction.reasonTwo": ["false"],
        "some.other.fields": ["abc", "xyz"],
      };

      vi.mocked(useStore).mockReturnValue([mockPassportData, "test-session"]);

      const result = useFeeBreakdown();

      expect(result?.reductions).toHaveLength(0);
    });

    it("parses 'true' exemption values to a list of keys", () => {
      const mockPassportData = {
        "application.fee.calculated": 1000,
        "application.fee.payable": 800,
        "application.fee.payable.vat": 160,
        "application.fee.exemption.reasonOne": ["true"],
        "application.fee.exemption.reasonTwo": ["true"],
        "some.other.fields": ["abc", "xyz"],
      };

      vi.mocked(useStore).mockReturnValue([mockPassportData, "test-session"]);

      const result = useFeeBreakdown();

      expect(result?.exemptions).toHaveLength(2);
      expect(result?.exemptions).toEqual(
        expect.arrayContaining(["reasonOne", "reasonTwo"])
      );
    });

    it("does not parse 'false' exemption values to a list of keys", () => {
      const mockPassportData = {
        "application.fee.calculated": 1000,
        "application.fee.payable": 800,
        "application.fee.payable.vat": 160,
        "application.fee.exemption.reasonOne": ["false"],
        "application.fee.exemption.reasonTwo": ["false"],
        "some.other.fields": ["abc", "xyz"],
      };

      vi.mocked(useStore).mockReturnValue([mockPassportData, "test-session"]);

      const result = useFeeBreakdown();

      expect(result?.exemptions).toHaveLength(0);
    });
  });

  describe("invalid inputs", () => {
    it("returns undefined for missing data", () => {
      const mockPassportData = {
        "some.other.fields": ["abc", "xyz"],
      };

      vi.mocked(useStore).mockReturnValue([mockPassportData, "test-session"]);

      const result = useFeeBreakdown();

      expect(result).toBeUndefined();
    });

    it("returns undefined for partial data", () => {
      const mockPassportData = {
        "application.fee.calculated": [1000],
        "application.fee.payable.vat": [160],
        "some.other.fields": ["abc", "xyz"],
      };

      vi.mocked(useStore).mockReturnValue([mockPassportData, "test-session"]);

      const result = useFeeBreakdown();

      expect(result).toBeUndefined();
    });

    it("returns undefined for incorrect data", () => {
      const mockPassportData = {
        "application.fee.calculated": "some string",
        "application.fee.payable": [800, 700],
        "application.fee.payable.vat": false,
        "some.other.fields": ["abc", "xyz"],
      };

      vi.mocked(useStore).mockReturnValue([mockPassportData, "test-session"]);

      const result = useFeeBreakdown();

      expect(result).toBeUndefined();
    });

    it("calls Airbrake if invalid inputs are provided", () => {
      const mockPassportData = {
        "some.other.fields": ["abc", "xyz"],
      };
      const mockSessionId = "test-session";

      vi.mocked(useStore).mockReturnValue([mockPassportData, mockSessionId]);
      const loggerSpy = vi.spyOn(logger, "notify");

      const result = useFeeBreakdown();

      expect(result).toBeUndefined();

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining(mockSessionId),
      );

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining("ZodError"),
      );
    });
  });
});
