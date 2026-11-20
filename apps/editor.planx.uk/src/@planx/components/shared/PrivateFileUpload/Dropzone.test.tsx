import type { FileUploadSlot } from "@planx/components/FileUpload/model";
import { MAX_FILENAME_LENGTH } from "@planx/file-upload";
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
const invalidLengthMessage = expect.stringContaining(
  `File name must be under ${MAX_FILENAME_LENGTH} characters long`,
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

  it("rejects an empty file", async () => {
    const { slots } = await dropFile(
      new File([], "plan.pdf", { type: "application/pdf" }),
    );

    expect(alertMock).toHaveBeenCalledWith("File is empty");
    expect(slots()).toHaveLength(0);
  });

  it("rejects a file whose name is too long once encoded", async () => {
    // short enough as typed, but curly apostrophe %-encodes to 9 chars
    const filename = `${"’".repeat(30)}.pdf`;
    expect(filename.length).toBeLessThan(MAX_FILENAME_LENGTH);

    const { slots } = await dropFile(
      new File(["x"], filename, { type: "application/pdf" }),
    );

    expect(alertMock).toHaveBeenCalledWith(
      "Please reduce the length of the file name and try again",
    );
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

  it("does not accept an extremely long filename", async () => {
    const { slots } = await dropFile(
      new File(
        ["x"],
        "longfilenamelongfilenamelongfilenamelongfilenamelongfilenamelongfilenamelongfilename.pdf",
        { type: "application/pdf" },
      ),
    );

    expect(alertMock).toHaveBeenCalledWith(invalidLengthMessage);
    expect(slots()).toHaveLength(0);
  });
});
