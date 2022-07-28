import { waitFor } from "@testing-library/react";
import { NaviRequest } from "navi";
import { FullStore, vanillaStore } from "pages/FlowEditor/lib/store";
import { ApplicationPath } from "types";

import { isSaveReturnFlow, setPath } from "./utils";

const { getState, setState } = vanillaStore;
let initialState: FullStore;

const mockFlow = {
  _root: {
    edges: ["p3uGKbcian", "G59w5rVEYA"],
  },
  G59w5rVEYA: {
    data: {
      heading: "Application sent",
      moreInfo: "More info",
      contactInfo: "Contact info",
      description: "Description",
    },
    type: 725,
  },
  NUvpgTW614: {
    data: {
      text: "B",
    },
    type: 200,
  },
  YWSBqlmHmR: {
    data: {
      text: "A",
    },
    type: 200,
  },
  p3uGKbcian: {
    data: {
      text: "Question 1",
    },
    type: 100,
    edges: ["YWSBqlmHmR", "NUvpgTW614"],
  },
};

const mockSendFlow = {
  _root: {
    edges: ["p3uGKbcian", "IeiIfq1Pw8", "G59w5rVEYA"],
  },
  G59w5rVEYA: {
    data: {
      heading: "Application sent",
      moreInfo: "More info",
      contactInfo: "Contact info",
      description: "Description",
    },
    type: 725,
  },
  IeiIfq1Pw8: {
    data: {
      title: "Send",
      destination: "uniform",
    },
    type: 650,
  },
  NUvpgTW614: {
    data: {
      text: "B",
    },
    type: 200,
  },
  YWSBqlmHmR: {
    data: {
      text: "A",
    },
    type: 200,
  },
  p3uGKbcian: {
    data: {
      text: "Question 1",
    },
    type: 100,
    edges: ["YWSBqlmHmR", "NUvpgTW614"],
  },
};

describe("isSaveReturnFlow helper function", () => {
  it("correctly identifies flows with a 'Send' node", () => {
    expect(isSaveReturnFlow(mockSendFlow)).toEqual(true);
  });

  it("correctly identifies flows without a 'Send' node", () => {
    expect(isSaveReturnFlow(mockFlow)).toEqual(false);
  });
});

describe("setPath helper function", () => {
  beforeAll(() => (initialState = getState()));

  afterEach(() => waitFor(() => setState(initialState)));

  it("correctly sets the path for a 'Save/Return' user journey", () => {
    const mockNaviRequest = { params: {} } as unknown as NaviRequest;
    setPath(mockSendFlow, mockNaviRequest);
    // No sessionId in URL, and "Send" flow shows Confirm Email x2 prompt
    expect(getState().path).toEqual(ApplicationPath.SaveAndReturn);
  });

  it("correctly sets the path for a 'Single session' user journey", () => {
    const mockNaviRequest = { params: {} } as unknown as NaviRequest;
    setPath(mockFlow, mockNaviRequest);
    // Flow without "Send" does not trigger any Save & Return UI
    expect(getState().path).toEqual(ApplicationPath.SingleSession);
  });

  it("correctly sets the path for a 'Single session' user journey, even with sessionId in the URL", () => {
    const mockNaviRequest = {
      params: { sessionId: "123" },
    } as unknown as NaviRequest;
    setPath(mockFlow, mockNaviRequest);
    expect(getState().path).toEqual(ApplicationPath.SingleSession);
  });

  it("correctly sets the path for a 'Resume' user journey", () => {
    const mockNaviRequest = {
      params: { sessionId: "123" },
    } as unknown as NaviRequest;
    setPath(mockSendFlow, mockNaviRequest);
    // "Send" component in flow, and sessionId in URL means that the user is resuming an existing session
    expect(getState().path).toEqual(ApplicationPath.Resume);
  });
});
