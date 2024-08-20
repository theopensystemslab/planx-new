import { useStore } from "pages/FlowEditor/lib/store";
import setupServiceSettingsScreen, {
  mockWindowLocationObject,
} from "./helpers/setupServiceSettingsScreen";
import { fireEvent, screen } from "@testing-library/react";
import { exp } from "mathjs";
import userEvent from "@testing-library/user-event";

const { getState, setState } = useStore;

const subdomainStateData = {
  flowSettings: {},
  teamDomain: "mockedteamdomain.com",
  flowSlug: "mock-planning-permish",
};

const nonSubdomainStateData = {
  flowSettings: {},
  teamDomain: undefined,
  teamName: "mockTeam",
  flowSlug: "mock-planning-permish",
};

const publishedUrl = `${mockWindowLocationObject.origin}${mockWindowLocationObject.pathname}/published`;

const disabledCopyCheck = () => {
  const copyButton = screen.getByRole("button", { name: `copy` });
  expect(copyButton).toBeDisabled();
};

const enabledCopyCheck = () => {
  const copyButton = screen.getByRole("button", { name: `copy` });
  expect(copyButton).toBeEnabled();
};

const inactiveLinkCheck = async (link: string) => {
  const publicLink = await screen.findByText(link);
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
      ...subdomainStateData,
      isFlowPublished: true,
      flowStatus: "offline",
    });

    // render the <ServiceSettings/> comp
    setupServiceSettingsScreen();
  });

  it("has a public link with the subdomain url in a <p> tag", async () => {
    const { flowSlug, teamDomain } = getState();

    await inactiveLinkCheck(`https://${teamDomain}/${flowSlug}`);
  });
  it("has a disabled copy button", disabledCopyCheck);
});

describe("A team with a subdomain has an online, unpublished service. ", () => {
  beforeEach(async () => {
    // setup state values that <ServiceSettings/> depends on
    setState({
      ...subdomainStateData,
      isFlowPublished: false,
      flowStatus: "online",
    });

    // render the <ServiceSettings/> comp
    setupServiceSettingsScreen();
  });

  it("has a public link with the subdomain url in a <p> tag", async () => {
    const { flowSlug, teamDomain } = getState();

    await inactiveLinkCheck(`https://${teamDomain}/${flowSlug}`);
  });
  it("has a disabled copy button", disabledCopyCheck);
});

describe("A team with a subdomain has an online, published service. ", () => {
  beforeEach(async () => {
    // setup state values that <ServiceSettings/> depends on
    setState({
      ...subdomainStateData,
      isFlowPublished: true,
      flowStatus: "online",
    });
    // mock navigator.clipboard fn
    jest
      .spyOn(navigator.clipboard, "writeText")
      .mockImplementation(() => Promise.resolve());

    // render the <ServiceSettings/> comp
    const user = await setupServiceSettingsScreen();
  });

  it("has a public link with the subdomain url in an <a> tag", async () => {
    // render the <ServiceSettings/> comp
    const { flowSlug, teamDomain } = getState();

    await activeLinkCheck(`https://${teamDomain}/${flowSlug}`);
  });
  it("has an enabled copy button", async () => {
    // render the <ServiceSettings/> comp
    enabledCopyCheck();
  });
  it("can be copied to the clipboard", async () => {
    const copyButton = screen.getByRole("button", { name: `copy` });

    fireEvent.click(copyButton);

    const { flowSlug, teamDomain } = getState();

    expect(navigator.clipboard.writeText).toBeCalledWith(
      `https://${teamDomain}/${flowSlug}`
    );
  });
});

describe("An active link is", () => {
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
    await setupServiceSettingsScreen();

    jest
      .spyOn(navigator.clipboard, "writeText")
      .mockImplementation(() => Promise.resolve());
  });

  it("copied to the clipboard", async () => {
    const copyButton = screen.getByRole("button", { name: `copy` });

    fireEvent.click(copyButton);

    const { flowSlug, teamDomain } = getState();

    expect(navigator.clipboard.writeText).toBeCalledWith(
      `https://${teamDomain}/${flowSlug}`
    );
  });
});

describe("A team without a subdomain has an offline, published service. ", () => {
  beforeEach(async () => {
    // setup state values that <ServiceSettings/> depends on
    setState({
      ...nonSubdomainStateData,
      flowStatus: "offline",
      isFlowPublished: true,
    });

    // Mocking window.location.origin
    jest
      .spyOn(window, "location", "get")
      .mockReturnValue(mockWindowLocationObject);

    // render the <ServiceSettings/> comp
    setupServiceSettingsScreen();
  });

  it("has a public link with the url in a <p> tag", async () => {
    await inactiveLinkCheck(publishedUrl);
  });
  it("has a disabled copy button", disabledCopyCheck);
});

describe("A team without a subdomain has an online, unpublished service. ", () => {
  beforeEach(async () => {
    // setup state values that <ServiceSettings/> depends on
    setState({
      ...nonSubdomainStateData,
      flowStatus: "online",
      isFlowPublished: false,
    });

    // Mocking window.location.origin
    jest
      .spyOn(window, "location", "get")
      .mockReturnValue(mockWindowLocationObject);

    // render the <ServiceSettings/> comp
    setupServiceSettingsScreen();
  });

  it("has a public link with the url in a <p> tag", async () => {
    await inactiveLinkCheck(publishedUrl);
  });
  it("has a disabled copy button", disabledCopyCheck);
});

describe("A team without a subdomain has an online, published service. ", () => {
  beforeEach(async () => {
    // setup state values that <ServiceSettings/> depends on
    setState({
      ...nonSubdomainStateData,
      flowStatus: "online",
      isFlowPublished: true,
    });
    // Mocking window.location.origin
    jest
      .spyOn(window, "location", "get")
      .mockReturnValue(mockWindowLocationObject);

    // mock navigator.clipboard fn
    jest
      .spyOn(navigator.clipboard, "writeText")
      .mockImplementation(() => Promise.resolve());
  });

  it("has a public link with the subdomain url in an <a> tag", async () => {
    // render the <ServiceSettings/> comp
    setupServiceSettingsScreen();
    await activeLinkCheck(publishedUrl);
  });
  it("has a enabled copy button", () => {
    // render the <ServiceSettings/> comp
    setupServiceSettingsScreen();
    enabledCopyCheck();
  });

  it("can be copied to the clipboard", async () => {
    // render the <ServiceSettings/> comp
    const user = await setupServiceSettingsScreen();
    const copyButton = screen.getByRole("button", { name: `copy` });

    user.click(copyButton);

    expect(await screen.findByText("copied")).toBeVisible();
    expect(navigator.clipboard.writeText).toBeCalledWith(publishedUrl);
  });
});
