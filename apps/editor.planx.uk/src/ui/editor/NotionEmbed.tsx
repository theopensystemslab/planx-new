const DEFAULT_WORKSPACE = "opensystemslab";

// A page is either a bare id (published in the default workspace) or an
// { id, workspace } pair when it lives in another workspace's *.notion.site
const NOTION_PAGES = {
  resources: "6b896f88be4c4b4c8ec8474a34c70d7c",
  onboarding: "2e6ea7226c53440280fbd0aaaa1a0fa3",
  tutorials: "d0918f124af9414ca765c5336c1cbc5b",
  // Same source page as the API-backed guide (api.planx.uk `modules/notion`)
  howToUseComponent: {
    id: "3d6a3c448ac280baa77bd6dc264906b8",
    workspace: "ianjo",
  },
} as const;

export type NotionEmbedPage = keyof typeof NOTION_PAGES;

const NotionEmbed: React.FC<{
  page: NotionEmbedPage;
  title: string;
}> = ({ page, title }) => {
  const entry = NOTION_PAGES[page];
  const { id, workspace } =
    typeof entry === "string"
      ? { id: entry, workspace: DEFAULT_WORKSPACE }
      : entry;
  const embedUrl = `https://${workspace}.notion.site/ebd//${id}`;

  return (
    <iframe
      src={embedUrl}
      width="100%"
      height="600"
      style={{
        width: "100%",
        height: "100%",
        border: "0",
        padding: "0",
        zIndex: 1,
      }}
      title={title}
    />
  );
};

export default NotionEmbed;
