import { clearLocalFlow, getLocalFlow, setLocalFlow } from "./local";

const mockedState = {
  breadcrumbs: {
    RYYckLE2cH: { auto: false, answers: ["5sWfsvXphd"] },
    bDqCpYu3bl: { auto: false, answers: ["7889n06rwZ"] },
    jtIAZaGVYe: { auto: false, data: { "application.fee.payable": 0.2 } },
  },
  id: "928bb51c-b3d3-4afe-b4e5-d00b7d114e69",
  passport: { data: { "application.fee.payable": 0.2 } },
  sessionId: "",
};

const flowId = "928bb51c-b3d3-4afe-b4e5-d00b7d114e69";

describe("getting & setting local flow", () => {
  it("sets & retrieves local flow", () => {
    setLocalFlow(flowId, mockedState);
    expect(getLocalFlow(flowId)).toEqual(mockedState);
  });

  it("clears local flow", () => {
    setLocalFlow(flowId, mockedState);
    clearLocalFlow(flowId);

    expect(getLocalFlow(flowId)).toBeFalsy();
  });
});
