import { Store } from "pages/FlowEditor/lib/store";

import { handleSetFees } from "./utils";

describe("handleSetFees() function", () => {
  describe("reconciling calculated and payable without extra charges", () => {
    it("outputs calculated = payable when the incoming passport only includes `application.fee.calculated`", () => {
      const incomingPassport: Store.Passport = {
        data: {
          "application.fee.calculated": 200,
        },
      };

      const result = handleSetFees({
        passport: incomingPassport,
        applyCalculatedVAT: false,
        fastTrackFeeAmount: 0,
        applyServiceCharge: false,
        applyPaymentProcessingFee: false,
      });

      expect(result).toEqual({
        "application.fee.calculated": 200,
        "application.fee.payable": 200,
        "application.fee.payable.VAT": 0,
      });
    });

    it("outputs original calculated and payable when the incoming passport includes both `application.fee.calculated` and `application.fee.payable`", () => {
      const incomingPassport: Store.Passport = {
        data: {
          "application.fee.calculated": 200,
          "application.fee.payable": 0,
          "application.fee.exemption.disability": ["true"],
        },
      };

      const result = handleSetFees({
        passport: incomingPassport,
        applyCalculatedVAT: false,
        fastTrackFeeAmount: 0,
        applyServiceCharge: false,
        applyPaymentProcessingFee: false,
      });

      expect(result).toEqual({
        "application.fee.calculated": 200,
        "application.fee.payable": 0,
        "application.fee.payable.VAT": 0,
      });
    });
  });

  describe("adding VAT to an application fee", () => {
    it("adds VAT to `application.fee.calculated`", () => {
      const incomingPassport: Store.Passport = {
        data: {
          "application.type": ["preApp"],
          "application.fee.calculated": 200,
        },
      };

      const result = handleSetFees({
        passport: incomingPassport,
        applyCalculatedVAT: true,
        fastTrackFeeAmount: 0,
        applyServiceCharge: false,
        applyPaymentProcessingFee: false,
      });

      expect(result).toEqual({
        "application.fee.calculated": 200,
        "application.fee.calculated.VAT": 40,
        "application.fee.payable": 240,
        "application.fee.payable.VAT": 40,
      });
    });
  });

  describe("adding Fast Track fee", () => {
    it("does not add Fast Track if passport does not have `application.fastTrack` present", () => {
      const incomingPassport: Store.Passport = {
        data: {
          "application.fee.calculated": 200,
        },
      };

      const result = handleSetFees({
        passport: incomingPassport,
        applyCalculatedVAT: false,
        fastTrackFeeAmount: 150,
        applyServiceCharge: false,
        applyPaymentProcessingFee: false,
      });

      expect(result).toEqual({
        "application.fee.calculated": 200,
        "application.fee.payable": 200,
        "application.fee.payable.VAT": 0,
      });
    });

    it("does not add Fast Track if the Fast Track amount is not greater than 0", () => {
      const incomingPassport: Store.Passport = {
        data: {
          "application.fee.calculated": 200,
          "application.fastTrack": ["true"],
        },
      };

      const result = handleSetFees({
        passport: incomingPassport,
        applyCalculatedVAT: false,
        fastTrackFeeAmount: 0,
        applyServiceCharge: false,
        applyPaymentProcessingFee: false,
      });

      expect(result).toEqual({
        "application.fee.calculated": 200,
        "application.fee.payable": 200,
        "application.fee.payable.VAT": 0,
      });
    });

    it("adds Fast Track and VAT if passport has `application.fastTrack`", () => {
      const incomingPassport: Store.Passport = {
        data: {
          "application.fee.calculated": 200,
          "application.fastTrack": ["true"],
        },
      };

      const result = handleSetFees({
        passport: incomingPassport,
        applyCalculatedVAT: false,
        fastTrackFeeAmount: 150,
        applyServiceCharge: false,
        applyPaymentProcessingFee: false,
      });

      expect(result).toEqual({
        "application.fee.calculated": 200,
        "application.fee.payable": 380,
        "application.fee.payable.VAT": 30,
        "application.fee.fastTrack": 150,
        "application.fee.fastTrack.VAT": 30,
      });
    });

    it("sums Fast Track and discretionary application fee VAT when applicable", () => {
      const incomingPassport: Store.Passport = {
        data: {
          "application.type": ["preApp"],
          "application.fee.calculated": 200,
          "application.fastTrack": ["true"],
        },
      };

      const result = handleSetFees({
        passport: incomingPassport,
        applyCalculatedVAT: true,
        fastTrackFeeAmount: 183,
        applyServiceCharge: false,
        applyPaymentProcessingFee: false,
      });

      expect(result).toEqual({
        "application.fee.calculated": 200,
        "application.fee.calculated.VAT": 40,
        "application.fee.payable": 459.6,
        "application.fee.payable.VAT": 76.6,
        "application.fee.fastTrack": 183,
        "application.fee.fastTrack.VAT": 36.6,
      });
    });
  });

  describe("adding service charge", () => {
    it("does not add service charge if the SetFee toggle is `off`", () => {
      const incomingPassport: Store.Passport = {
        data: {
          "application.fee.calculated": 200,
        },
      };

      const result = handleSetFees({
        passport: incomingPassport,
        applyCalculatedVAT: false,
        fastTrackFeeAmount: 0,
        applyServiceCharge: false,
        applyPaymentProcessingFee: false,
      });

      expect(result).toEqual({
        "application.fee.calculated": 200,
        "application.fee.payable": 200,
        "application.fee.payable.VAT": 0,
      });
    });

    it("does not add service charge if total payable after Fast Track is less than £100", () => {
      const incomingPassport: Store.Passport = {
        data: {
          "application.fee.calculated": 200,
          "application.fee.payable": 0,
          "application.fee.exemption.disability": ["true"],
          "application.fastTrack": ["yes"],
        },
      };

      const result = handleSetFees({
        passport: incomingPassport,
        applyCalculatedVAT: false,
        fastTrackFeeAmount: 50,
        applyServiceCharge: true,
        applyPaymentProcessingFee: false,
      });

      expect(result).toEqual({
        "application.fee.calculated": 200,
        "application.fee.payable": 60,
        "application.fee.payable.VAT": 10,
        "application.fee.fastTrack": 50,
        "application.fee.fastTrack.VAT": 10,
      });
    });

    it("adds service charge and VAT if SetFee toggle is `on` and total payable is greater than £100", () => {
      const incomingPassport: Store.Passport = {
        data: {
          "application.fee.calculated": 200,
        },
      };

      const result = handleSetFees({
        passport: incomingPassport,
        applyCalculatedVAT: false,
        fastTrackFeeAmount: 0,
        applyServiceCharge: true,
        applyPaymentProcessingFee: false,
      });

      expect(result).toEqual({
        "application.fee.calculated": 200,
        "application.fee.payable": 248,
        "application.fee.payable.VAT": 8,
        "application.fee.serviceCharge": 40,
        "application.fee.serviceCharge.VAT": 8,
      });
    });
  });

  describe("adding payment processing fee", () => {
    it("does not add payment processing fee if the SetFee toggle is `off`", () => {
      const incomingPassport: Store.Passport = {
        data: {
          "application.fee.calculated": 200,
        },
      };

      const result = handleSetFees({
        passport: incomingPassport,
        applyCalculatedVAT: false,
        fastTrackFeeAmount: 0,
        applyServiceCharge: false,
        applyPaymentProcessingFee: false,
      });

      expect(result).toEqual({
        "application.fee.calculated": 200,
        "application.fee.payable": 200,
        "application.fee.payable.VAT": 0,
      });
    });

    it("adds payment processing fee and VAT on top of all other applicable charges if Set toggle is `on`", () => {
      const incomingPassport: Store.Passport = {
        data: {
          "application.type": ["preApp"],
          "application.fee.calculated": 200,
          "application.fastTrack": ["yes"],
        },
      };

      const result = handleSetFees({
        passport: incomingPassport,
        applyCalculatedVAT: true,
        fastTrackFeeAmount: 80,
        applyServiceCharge: true,
        applyPaymentProcessingFee: true,
      });

      expect(result).toEqual({
        "application.fee.calculated": 200,
        "application.fee.calculated.VAT": 40,
        "application.fee.payable": 388.60799999999995, // total payable before payment processing = 384; 1% fee = 3.84 + 20% VAT =
        "application.fee.payable.VAT": 64.768,
        "application.fee.fastTrack": 80,
        "application.fee.fastTrack.VAT": 16,
        "application.fee.serviceCharge": 40,
        "application.fee.serviceCharge.VAT": 8,
        "application.fee.paymentProcessing": 3.84,
        "application.fee.paymentProcessing.VAT": 0.768,
      });
    });
  });
});
