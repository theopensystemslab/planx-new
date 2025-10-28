import { vi } from "vitest";

/**
 * Shared mock for default file upload behaviour
 * Recreating this with MSW is challenging due to the onProgress event used by Axios
 * This approach allows us to maintain a single mock of the happy path for file upload
 * 
 * @example
 * vi.mock("lib/api/fileUpload/requests");
 * const mockedUploadPrivateFile = vi.mocked(uploadPrivateFile);
 */
const defaultMockUpload = async (
  file: File,
  onProgress?: (percentage: number) => void,
) => {
  // Simulate progress events
  if (onProgress) {
    onProgress(0);
    await new Promise((resolve) => setTimeout(resolve, 10));
    onProgress(0.5);
    await new Promise((resolve) => setTimeout(resolve, 10));
    onProgress(1);
  }
  
  return {
    fileType: file.type || "image/png",
    fileUrl: `https://api.editor.planx.dev/file/private/mock-nanoid/${file.name}`,
  };
};

// Mock the exported functions
export const uploadPrivateFile = vi.fn().mockImplementation(defaultMockUpload);
export const uploadPublicFile = vi.fn().mockImplementation(defaultMockUpload);