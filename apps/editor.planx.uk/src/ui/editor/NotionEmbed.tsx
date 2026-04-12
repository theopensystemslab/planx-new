import React from "react";

const NOTION_PAGES = {
  resources: "6b896f88be4c4b4c8ec8474a34c70d7c",
  onboarding: "2e6ea7226c53440280fbd0aaaa1a0fa3",
  tutorials: "d0918f124af9414ca765c5336c1cbc5b",
} as const;

const NotionEmbed: React.FC<{
  page: keyof typeof NOTION_PAGES;
  title: string;
}> = ({ page, title }) => {
  const pageId = NOTION_PAGES[page];
  const embedUrl = `https://opensystemslab.notion.site/ebd//${pageId}`;

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
