import { useStore } from "pages/FlowEditor/lib/store";
import ServiceSettings from "../ServiceSettings";
import setupServiceSettingsScreen, {
  mockWindowLocationObject,
} from "./helpers/setupServiceSettingsScreen";
import { screen } from "@testing-library/react";
import { rootFlowPath } from "routes/utils";

const { getState, setState } = useStore;

const publishedUrl = `${mockWindowLocationObject.origin}/${mockWindowLocationObject.pathname}/published`;

const disabledCopyCheck = () => {
  const copyButton = screen.getByRole("button", { name: `copy` });
  expect(copyButton).toBeDisabled();
};

const enabledCopyCheck = () => {
  const copyButton = screen.getByRole("button", { name: `copy` });
  expect(copyButton).toBeEnabled();
};

const checkCopyFunction = () => {};

const inactiveLinkCheck = async (link: string) => {
  const publicLink = await screen.findByText(`${link}`);

  expect(publicLink.tagName).toBe("P");
};

const activeLinkCheck = async (link: string) => {
  const publicLink = await screen.findByText(`${link}`);

  expect(publicLink.tagName).toBe("A");
};

describe("A team with a subdomain has an offline, published service. ", () => {
  beforeEach(async () => {
    // setup state values that <ServiceSettings/> depends on
    setState({
      flowSettings: {},
      flowStatus: "offline",
      teamDomain: "mockedteamdomain.com",
      teamName: "mockTeam",
      isFlowPublished: true,
      flowSlug: "mock-planning-permish",
    });

    // render the <ServiceSettings/> comp
    setupServiceSettingsScreen();

    // Mocking window.location.origin
    jest
      .spyOn(window, "location", "get")
      .mockReturnValue(mockWindowLocationObject);
  });

  it("has a public link with the subdomain url in a <p> tag", async () => {
    const flowSlug = getState().flowSlug;
    const teamDomain = getState().teamDomain;
    const teamName = getState().teamName;

    inactiveLinkCheck(`https://${teamDomain}/${teamName}/${flowSlug}`);
  });
  it("has a disabled copy button", disabledCopyCheck);
});

describe("A team with a subdomain has an online, unpublished service. ", () => {
  beforeEach(async () => {
    // setup state values that <ServiceSettings/> depends on
    setState({
      flowSettings: {},
      flowStatus: "online",
      teamDomain: "mockedteamdomain.com",
      teamName: "mockTeam",
      isFlowPublished: false,
      flowSlug: "mock-planning-permish",
    });

    // render the <ServiceSettings/> comp
    setupServiceSettingsScreen();

    // Mocking window.location.origin
    jest
      .spyOn(window, "location", "get")
      .mockReturnValue(mockWindowLocationObject);
  });

  it("has a public link with the subdomain url in a <p> tag", async () => {
    const flowSlug = getState().flowSlug;
    const teamDomain = getState().teamDomain;
    const teamName = getState().teamName;

    inactiveLinkCheck(`https://${teamDomain}/${teamName}/${flowSlug}`);
  });
  it("has a disabled copy button", disabledCopyCheck);
});

describe("A team with a subdomain has an online, published service. ", () => {
  beforeEach(async () => {
    // setup state values that <ServiceSettings/> depends on
    setState({
      flowSettings: {},
      flowStatus: "online",
      teamDomain: "mockedteamdomain.com",
      teamName: "mockTeam",
      isFlowPublished: true,
      flowSlug: "mock-planning-permish",
    });

    // render the <ServiceSettings/> comp
    const user = await setupServiceSettingsScreen();

    // Mocking window.location.origin
    jest
      .spyOn(window, "location", "get")
      .mockReturnValue(mockWindowLocationObject);

    const copyButton = screen.getByRole("button", { name: `copy` });
    user.click(copyButton);
  });

  it("has a public link with the subdomain url in an <a> tag", async () => {
    // render the <ServiceSettings/> comp
    const { flowSlug, teamDomain, teamName } = getState();

    activeLinkCheck(`https://${teamDomain}/${teamName}/${flowSlug}`);
  });
  it("has an enabled copy button", async () => {
    // render the <ServiceSettings/> comp
    enabledCopyCheck();
  });
});

describe("A team with a subdomain has an online, published service. ", () => {
  beforeEach(async () => {
    // setup state values that <ServiceSettings/> depends on
    setState({
      flowSettings: {},
      flowStatus: "online",
      teamDomain: "mockedteamdomain.com",
      teamName: "mockTeam",
      isFlowPublished: true,
      flowSlug: "mock-planning-permish",
    });

    // render the <ServiceSettings/> comp
    const user = await setupServiceSettingsScreen();

    const copyButton = screen.getByRole("button", { name: `copy` });
    user.click(copyButton);

    // Mocking window.location.origin
    jest
      .spyOn(window, "location", "get")
      .mockReturnValue(mockWindowLocationObject);
  });

  it("copies the right link to the clipboard", async () => {
    const { flowSlug, teamDomain, teamName } = getState();

    expect(await navigator.clipboard.readText()).toEqual(
      `https://${teamDomain}/${teamName}/${flowSlug}`
    );
  });
});

describe("A team without a subdomain has an offline, published service. ", () => {
  beforeEach(async () => {
    // setup state values that <ServiceSettings/> depends on
    setState({
      flowSettings: {},
      flowStatus: "offline",
      teamDomain: undefined,
      teamName: "mockTeam",
      isFlowPublished: true,
      flowSlug: "mock-planning-permish",
    });

    // render the <ServiceSettings/> comp
    setupServiceSettingsScreen();

    // Mocking window.location.origin
    jest
      .spyOn(window, "location", "get")
      .mockReturnValue(mockWindowLocationObject);
  });

  it("has a public link without the subdomain url in a <p> tag", async () => {
    const flowSlug = getState().flowSlug;
    const teamDomain = getState().teamDomain;
    const teamName = getState().teamName;

    inactiveLinkCheck(publishedUrl);
  });
  it("has a disabled copy button", disabledCopyCheck);
});

describe("A team without a subdomain has an online, unpublished service. ", () => {
  beforeEach(async () => {
    // setup state values that <ServiceSettings/> depends on
    setState({
      flowSettings: {},
      flowStatus: "online",
      teamDomain: undefined,
      teamName: "mockTeam",
      isFlowPublished: false,
      flowSlug: "mock-planning-permish",
    });

    // render the <ServiceSettings/> comp
    setupServiceSettingsScreen();

    // Mocking window.location.origin
    jest
      .spyOn(window, "location", "get")
      .mockReturnValue(mockWindowLocationObject);
  });

  it("has a public link with the subdomain url in a <p> tag", async () => {
    const flowSlug = getState().flowSlug;
    const teamDomain = getState().teamDomain;
    const teamName = getState().teamName;

    inactiveLinkCheck(publishedUrl);
  });
  it("has a disabled copy button", disabledCopyCheck);
});

describe("A team without a subdomain has an online, published service. ", () => {
  beforeEach(async () => {
    // setup state values that <ServiceSettings/> depends on
    setState({
      flowSettings: {},
      flowStatus: "online",
      teamDomain: undefined,
      teamName: "mockTeam",
      isFlowPublished: true,
      flowSlug: "mock-planning-permish",
    });

    // render the <ServiceSettings/> comp
    setupServiceSettingsScreen();

    // Mocking window.location.origin
    jest
      .spyOn(window, "location", "get")
      .mockReturnValue(mockWindowLocationObject);
  });

  it("has a public link with the subdomain url in an <a> tag", async () => {
    const flowSlug = getState().flowSlug;
    const teamDomain = getState().teamDomain;
    const teamName = getState().teamName;

    activeLinkCheck(publishedUrl);
  });
  it("has a disabled copy button", enabledCopyCheck);
});
