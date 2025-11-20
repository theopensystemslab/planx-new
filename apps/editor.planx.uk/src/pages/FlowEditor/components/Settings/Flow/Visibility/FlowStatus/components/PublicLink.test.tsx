import { screen } from "@testing-library/react";
import { useStore } from "pages/FlowEditor/lib/store";
import { vi } from "vitest";

import {
  offlinePublished,
  offlineUnpublished,
  onlinePublished,
  onlineUnpublished,
} from "./test/mocks";
import {
  activeLinkCheck,
  disabledCopyCheck,
  enabledCopyCheck,
  inactiveLinkCheck,
  setupFlowStatusScreen,
} from "./test/utils";

export const mockWindowLocationObject = {
  origin: "https://mocked-origin.com",
  hash: "",
  host: "dummy.com",
  port: "80",
  protocol: "http:",
  hostname: "dummy.com",
  href: "http://dummy.com?page=1&name=testing",
  pathname: "/mockTeam/mock-planning-permish",
  search: "",
  assign: vi.fn(),
  reload: vi.fn(),
  replace: vi.fn(),
  ancestorOrigins: {
    length: 0,
    contains: () => true,
    item: () => null,
    [Symbol.iterator]: vi.fn(),
  },
};

vi.spyOn(window, "location", "get").mockReturnValue(mockWindowLocationObject);

const { getState, setState } = useStore;

const subdomainStateData = {
  teamDomain: "mockedteamdomain.com",
  flowSlug: "mock-planning-permish",
};

const nonSubdomainStateData = {
  teamDomain: undefined,
  teamName: "mockTeam",
  flowSlug: "mock-planning-permish",
};

const publishedUrl = `${mockWindowLocationObject.origin}${mockWindowLocationObject.pathname}/published`;

describe("A team with a subdomain has an offline, published service.", () => {
  beforeEach(async () => {
    setState({
      ...subdomainStateData,
      id: "abc123",
      isFlowPublished: true,
      flowStatus: "offline",
    });

    await setupFlowStatusScreen(offlinePublished);
  });

  // eslint-disable-next-line @vitest/expect-expect
  it("has a public link with the subdomain url in a <p> tag", async () => {
    const { flowSlug, teamDomain } = getState();

    await inactiveLinkCheck(`https://${teamDomain}/${flowSlug}`);
  });

  // eslint-disable-next-line @vitest/expect-expect
  it("has a disabled copy button", disabledCopyCheck);
});

describe("A team with a subdomain has an online, unpublished service.", () => {
  beforeEach(async () => {
    setState({
      ...subdomainStateData,
      id: "abc123",
      isFlowPublished: false,
      flowStatus: "online",
    });

    await setupFlowStatusScreen(onlineUnpublished);
  });

  // eslint-disable-next-line @vitest/expect-expect
  it("has a public link with the subdomain url in a <p> tag", async () => {
    const { flowSlug, teamDomain } = getState();

    await inactiveLinkCheck(`https://${teamDomain}/${flowSlug}`);
  });

  // eslint-disable-next-line @vitest/expect-expect
  it("has a disabled copy button", disabledCopyCheck);
});

describe("A team with a subdomain has an online, published service.", () => {
  beforeEach(async () => {
    setState({
      ...subdomainStateData,
      id: "abc123",
      isFlowPublished: true,
      flowStatus: "online",
    });
    // mock navigator.clipboard fn
    vi.spyOn(navigator.clipboard, "writeText").mockImplementation(() =>
      Promise.resolve(),
    );
  });

  // eslint-disable-next-line @vitest/expect-expect
  it("has a public link with the subdomain url in an <a> tag", async () => {
    const { flowSlug, teamDomain } = getState();
    await setupFlowStatusScreen(onlinePublished);

    await activeLinkCheck(`https://${teamDomain}/${flowSlug}`);
  });

  // eslint-disable-next-line @vitest/expect-expect
  it("has an enabled copy button", async () => {
    await setupFlowStatusScreen(onlinePublished);

    enabledCopyCheck();
  });

  it("can be copied to the clipboard", async () => {
    const { flowSlug, teamDomain } = getState();
    const user = await setupFlowStatusScreen(onlinePublished);

    const copyButton = screen.getByRole("button", { name: `copy` });

    user.click(copyButton);

    expect((await screen.findAllByText("copied"))[0]).toBeVisible();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      `https://${teamDomain}/${flowSlug}`,
    );
  });
});

describe("A team with a subdomain has an offline, unpublished service.", () => {
  beforeEach(async () => {
    setState({
      ...subdomainStateData,
      id: "abc123",
      isFlowPublished: false,
      flowStatus: "offline",
    });

    await setupFlowStatusScreen(offlineUnpublished);
  });

  // eslint-disable-next-line @vitest/expect-expect
  it("has a public link with the subdomain url in a <p> tag", async () => {
    const { flowSlug, teamDomain } = getState();

    await inactiveLinkCheck(`https://${teamDomain}/${flowSlug}`);
  });

  // eslint-disable-next-line @vitest/expect-expect
  it("has a disabled copy button", disabledCopyCheck);
});

describe("A team without a subdomain has an offline, published service.", () => {
  beforeEach(async () => {
    setState({
      ...nonSubdomainStateData,
      id: "abc123",
      flowStatus: "offline",
      isFlowPublished: true,
    });

    await setupFlowStatusScreen(offlinePublished);
  });

  // eslint-disable-next-line @vitest/expect-expect
  it("has a public link with the url in a <p> tag", async () => {
    await inactiveLinkCheck(publishedUrl);
  });

  // eslint-disable-next-line @vitest/expect-expect
  it("has a disabled copy button", disabledCopyCheck);
});

describe("A team without a subdomain has an online, unpublished service.", () => {
  beforeEach(async () => {
    setState({
      ...nonSubdomainStateData,
      id: "abc123",
      flowStatus: "online",
      isFlowPublished: false,
    });

    await setupFlowStatusScreen(onlineUnpublished);
  });

  // eslint-disable-next-line @vitest/expect-expect
  it("has a public link with the url in a <p> tag", async () => {
    await inactiveLinkCheck(publishedUrl);
  });

  // eslint-disable-next-line @vitest/expect-expect
  it("has a disabled copy button", disabledCopyCheck);
});

describe("A team without a subdomain has an online, published service.", () => {
  beforeEach(async () => {
    setState({
      ...nonSubdomainStateData,
      id: "abc123",
      flowStatus: "online",
      isFlowPublished: true,
    });

    // mock navigator.clipboard fn
    vi.spyOn(navigator.clipboard, "writeText").mockImplementation(() =>
      Promise.resolve(),
    );
  });

  // eslint-disable-next-line @vitest/expect-expect
  it("has a public link with the subdomain url in an <a> tag", async () => {
    await setupFlowStatusScreen(onlinePublished);
    await activeLinkCheck(publishedUrl);
  });

  // eslint-disable-next-line @vitest/expect-expect
  it("has an enabled copy button", async () => {
    await setupFlowStatusScreen(onlinePublished);
    enabledCopyCheck();
  });

  it("can be copied to the clipboard", async () => {
    const user = await setupFlowStatusScreen(onlinePublished);
    const copyButton = screen.getByRole("button", { name: "copy" });

    user.click(copyButton);

    expect((await screen.findAllByText("copied"))[0]).toBeVisible();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(publishedUrl);
  });
});

describe("A team without a subdomain has an offline, unpublished service.", () => {
  beforeEach(async () => {
    setState({
      ...nonSubdomainStateData,
      id: "abc123",
      flowStatus: "offline",
      isFlowPublished: false,
    });

    await setupFlowStatusScreen(offlineUnpublished);
  });

  // eslint-disable-next-line @vitest/expect-expect
  it("has a public link with the url in a <p> tag", async () => {
    await inactiveLinkCheck(publishedUrl);
  });

  // eslint-disable-next-line @vitest/expect-expect
  it("has a disabled copy button", disabledCopyCheck);
});
