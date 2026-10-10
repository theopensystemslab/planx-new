import { getFeeBreakdown } from "@opensystemslab/planx-core";

import { getFeeLines } from "./feeLines.js";

describe("getFeeLines", () => {
  it("derives the application fee as the remainder of the payable total", () => {
    const feeLines = getFeeLines(
      getFeeBreakdown({
        "application.fee.calculated": 121,
        "application.fee.payable": 145,
        "application.fee.serviceCharge": 40,
        "application.fee.serviceCharge.VAT": 8,
      }),
    );

    expect(feeLines).toEqual([
      {
        description: "Application fee",
        payee: "council",
        net: 9700,
        vat: 0,
        total: 9700,
      },
      {
        description: "PlanX service charge",
        payee: "planx",
        net: 4000,
        vat: 800,
        total: 4800,
      },
    ]);
  });

  it("assigns the service charge to PlanX and everything else to the council", () => {
    const feeLines = getFeeLines(
      getFeeBreakdown({
        "application.fee.calculated": 100,
        "application.fee.calculated.VAT": 20,
        "application.fee.payable": 228,
        "application.fee.payable.VAT": 38,
        "application.fee.fastTrack": 50,
        "application.fee.fastTrack.VAT": 10,
        "application.fee.serviceCharge": 40,
        "application.fee.serviceCharge.VAT": 8,
      }),
    );

    expect(feeLines).toEqual([
      {
        description: "Application fee",
        payee: "council",
        net: 10000,
        vat: 2000,
        total: 12000,
      },
      {
        description: "Fast Track fee",
        payee: "council",
        net: 5000,
        vat: 1000,
        total: 6000,
      },
      {
        description: "PlanX service charge",
        payee: "planx",
        net: 4000,
        vat: 800,
        total: 4800,
      },
    ]);
    expect(feeLines!.reduce((sum, { total }) => sum + total, 0)).toBe(22800);
  });

  it("omits secondary lines that are zero", () => {
    const feeLines = getFeeLines(
      getFeeBreakdown({
        "application.fee.calculated": 100,
        "application.fee.payable": 100,
      }),
    );

    expect(feeLines?.map(({ description }) => description)).toEqual([
      "Application fee",
    ]);
  });

  it("folds a reduction into the application fee", () => {
    const feeLines = getFeeLines(
      getFeeBreakdown({
        "application.fee.calculated": 200,
        "application.fee.payable": 150,
        "application.fee.reduction.sports": ["true"],
      }),
    );

    expect(feeLines).toEqual([
      {
        description: "Application fee",
        payee: "council",
        net: 15000,
        vat: 0,
        total: 15000,
      },
    ]);
  });

  it("includes VAT on a discretionary application fee", () => {
    const [applicationFee] = getFeeLines(
      getFeeBreakdown({
        "application.fee.calculated": 100,
        "application.fee.calculated.VAT": 20,
        "application.fee.payable": 120,
        "application.fee.payable.VAT": 20,
      }),
    )!;

    expect(applicationFee).toMatchObject({ net: 10000, vat: 2000 });
  });

  it("reduces application fee VAT in proportion to a VAT-able reduction", () => {
    // 50% reduction on a £100 + £20 VAT fee
    const [applicationFee] = getFeeLines(
      getFeeBreakdown({
        "application.fee.calculated": 100,
        "application.fee.calculated.VAT": 20,
        "application.fee.payable": 60,
        "application.fee.payable.VAT": 10,
        "application.fee.reduction.parishCouncil": ["true"],
      }),
    )!;

    expect(applicationFee).toMatchObject({
      net: 5000,
      vat: 1000,
      total: 6000,
    });
  });

  it("removes all application fee VAT for a VAT-able exemption", () => {
    const [applicationFee] = getFeeLines(
      getFeeBreakdown({
        "application.fee.calculated": 100,
        "application.fee.calculated.VAT": 20,
        "application.fee.payable": 0,
        "application.fee.payable.VAT": 0,
        "application.fee.exemption.disability": ["true"],
      }),
    )!;

    expect(applicationFee).toMatchObject({ net: 0, vat: 0, total: 0 });
  });

  it("rounds each line's VAT-inclusive total once", () => {
    const [, fastTrack] = getFeeLines(
      getFeeBreakdown({
        "application.fee.calculated": 100,
        "application.fee.payable": 100.25,
        "application.fee.payable.VAT": 0.125,
        "application.fee.fastTrack": 0.125,
        "application.fee.fastTrack.VAT": 0.125,
      }),
    )!;

    // Rounding net and VAT separately would give 13p + 13p = 26p
    expect(fastTrack).toMatchObject({ net: 12, vat: 13, total: 25 });
  });

  it("does not validate the application fee's net/VAT split", () => {
    // Payable is inconsistent - the application fee remainder (£10) is less than its VAT (£20)
    const [applicationFee] = getFeeLines(
      getFeeBreakdown({
        "application.fee.calculated": 100,
        "application.fee.calculated.VAT": 20,
        "application.fee.payable": 130,
        "application.fee.payable.VAT": 40,
        "application.fee.fastTrack": 100,
        "application.fee.fastTrack.VAT": 20,
      }),
    )!;

    expect(applicationFee).toMatchObject({
      net: -1000,
      vat: 2000,
      total: 1000,
    });
  });

  it("returns null if the itemised fees exceed the payable total", () => {
    const feeLines = getFeeLines(
      getFeeBreakdown({
        "application.fee.calculated": 10,
        "application.fee.payable": 30,
        "application.fee.serviceCharge": 40,
        "application.fee.serviceCharge.VAT": 8,
      }),
    );

    expect(feeLines).toBeNull();
  });
});
