type ZipFileName = `${string}.zip`;

export const downloadZipFile = (
  data: string,
  options: { filename: ZipFileName },
) => {
  if (!data) {
    console.error("No data to download");
    return;
  }
  const blobData = new Blob([data], { type: "application/zip" });
  try {
    const href = URL.createObjectURL(blobData);
    const link = document.createElement("a");
    link.href = href;
    link.setAttribute("download", options.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  } catch (error) {
    console.error("Error creating object URL:", error);
  }
};
