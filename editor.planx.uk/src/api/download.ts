export { downloadFile };

async function downloadFile(fileKey: string, fileHash: string) {
  const res = await fetch(
    `${process.env.REACT_APP_API_URL}/file/public/${fileKey}`,
    {
      method: "GET",
      headers: {
        "file-hash": fileHash,
      },
    }
  );
  return res.blob();
}
