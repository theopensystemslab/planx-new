import type { FileUploadSlot } from "@planx/components/FileUpload/model";
import { http, HttpResponse } from "msw";
import server from "test/mockServer";
import { setup } from "test/utils";
import type { Mock } from "vitest";
import { vi } from "vitest";

import { Dropzone } from "./Dropzone";

const UPLOAD_ENDPOINT = `${import.meta.env.VITE_APP_API_URL}/file/private/upload`;

const successHandler = http.post(UPLOAD_ENDPOINT, () =>
  HttpResponse.json({
    fileUrl: "https://api.example.com/file/private/nanoid/plan.png",
  }),
);

// fail loudly if a file we should reject editor-side is nonetheless sent to API
const forbiddenHandler = http.post(UPLOAD_ENDPOINT, () => {
  throw new Error("A rejected file should never be uploaded");
});

/**
 * react-dropzone calls onDrop even when every file was rejected, so `setSlots` is called either
 * way - with an updater which adds nothing. Replay the updaters to see what the user ends up with.
 */
const resolveSlots = (setSlots: Mock): FileUploadSlot[] =>
  setSlots.mock.calls.reduce<FileUploadSlot[]>(
    (slots, [updater]) =>
      typeof updater === "function" ? updater(slots) : updater,
    [],
  );

/**
 * user-event filters by the input's `accept` attribute before the file ever reaches the input,
 * which would stop our validator from running at all, so we disable it here to test that line
 */
const dropFile = async (file: File, createSlot?: () => FileUploadSlot) => {
  const setSlots = vi.fn();
  const { getByTestId, user } = await setup(
    <Dropzone
      slots={[]}
      setSlots={setSlots}
      setFileUploadStatus={vi.fn()}
      createSlot={createSlot}
    />,
    { applyAccept: false },
  );

  await user.upload(getByTestId("upload-input"), file);

  return { slots: () => resolveSlots(setSlots) };
};

const alertMock = vi.mocked(window.alert);
const invalidTypeMessage = expect.stringContaining(
  "File must be one of the following types",
);

describe("files we do not accept", () => {
  beforeEach(() => {
    server.use(forbiddenHandler);
  });

  it("rejects an executable which the browser types as application/octet-stream", async () => {
    const { slots } = await dropFile(
      new File(["x"], "virus.com", { type: "application/octet-stream" }),
    );

    expect(alertMock).toHaveBeenCalledWith(invalidTypeMessage);
    expect(slots()).toHaveLength(0);
  });

  it("rejects an extension variant of a MIME type we accept", async () => {
    // .jfif is mapped to image/jpeg by browsers, but is not in our allowlist
    const { slots } = await dropFile(
      new File(["x"], "photo.jfif", { type: "image/jpeg" }),
    );

    expect(alertMock).toHaveBeenCalledWith(invalidTypeMessage);
    expect(slots()).toHaveLength(0);
  });

  it("rejects a file with no extension at all", async () => {
    const { slots } = await dropFile(
      new File(["x"], "photo", { type: "image/png" }),
    );

    expect(alertMock).toHaveBeenCalledWith(invalidTypeMessage);
    expect(slots()).toHaveLength(0);
  });

  it("rejects a format we do not accept", async () => {
    const { slots } = await dropFile(
      new File(["x"], "doc.odt", {
        type: "application/vnd.oasis.opendocument.text",
      }),
    );

    expect(alertMock).toHaveBeenCalledWith(invalidTypeMessage);
    expect(slots()).toHaveLength(0);
  });

  it("does not create a slot for a rejected file", async () => {
    const createSlot = vi.fn();

    await dropFile(
      new File(["x"], "virus.exe", { type: "application/octet-stream" }),
      createSlot,
    );

    expect(createSlot).not.toHaveBeenCalled();
  });
});

describe("files we do accept", () => {
  beforeEach(() => {
    server.use(successHandler);
  });

  it("accepts a PNG", async () => {
    const { slots } = await dropFile(
      new File(["x"], "plan.png", { type: "image/png" }),
    );

    expect(alertMock).not.toHaveBeenCalled();
    expect(slots()).toHaveLength(1);
  });

  it("accepts a binary format the browser cannot type at all", async () => {
    // files like .bim or .ifc have no reliable MIME type, so are matched on extension alone
    const { slots } = await dropFile(
      new File(["x"], "model.ifc", { type: "" }),
    );

    expect(alertMock).not.toHaveBeenCalled();
    expect(slots()).toHaveLength(1);
  });

  it("accepts an uppercase extension", async () => {
    const { slots } = await dropFile(
      new File(["x"], "PLAN.PDF", { type: "application/pdf" }),
    );

    expect(alertMock).not.toHaveBeenCalled();
    expect(slots()).toHaveLength(1);
  });
});
