import { PassportFeeFields } from "./types";
import { calculateReduction, toFeeBreakdown, toNumber } from "./utils";

describe("toNumber() helper function", () => {
  it("outputs a number when passed a number", () => {
    const input = 12;
    const output = toNumber(input);

    expect(output).toEqual(input);
  });

  it("outputs a number when passed a number tuple", () => {
    const input: [number] = [12];
    const output = toNumber(input);

    expect(output).toEqual(12);
  });
});

describe("calculateReduction() helper function", () => {
  it("correctly outputs the reduction when a calculated value is provided", () => {
    const input: PassportFeeFields = {
      "application.fee.calculated": 100,
      "application.fee.payable": 50,
      "application.fee.payable.vat": 0,
    };
    const reduction = calculateReduction(input);

    expect(reduction).toEqual(50);
  });

  it("defaults to 0 when calculated is 0", () => {
    const input: PassportFeeFields = {
      "application.fee.calculated": 0,
      "application.fee.payable": 100,
      "application.fee.payable.vat": 0,
    };
    const reduction = calculateReduction(input);

    expect(reduction).toEqual(0);
  });
});

describe("toFeeBreakdown() helper function", () => {
  it("correctly maps fields", () => {
    const input: PassportFeeFields = {
      "application.fee.calculated": 100,
      "application.fee.payable": 50,
      "application.fee.payable.vat": 10,
    };

    const output = toFeeBreakdown(input);

    expect(output.applicationFee).toEqual(input["application.fee.calculated"]);
    expect(output.total).toEqual(input["application.fee.payable"]);
    expect(output.vat).toEqual(input["application.fee.payable.vat"]);
    expect(output.reduction).toEqual(50);
  });

  it("sets applicationFee to payable amount if no calculated value is provided", () => {
    const input: PassportFeeFields = {
      "application.fee.calculated": 0,
      "application.fee.payable": 50,
      "application.fee.payable.vat": 10,
    };

    const output = toFeeBreakdown(input);

    expect(output.applicationFee).toEqual(input["application.fee.payable"]);
  });
});
