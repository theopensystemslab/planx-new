import Emoji from "@tiptap/extension-emoji";
import Mention from "@tiptap/extension-mention";
import StarterKit from "@tiptap/starter-kit";

import CustomImage from "../RichTextImage";
import suggestion from "./components/emoji/suggestion";

export const passportClassName = "passport";

// Shared tiptap editor extensions
export const commonExtensions = [
  StarterKit.configure({
    link: {
      openOnClick: false,
      autolink: false,
    },
    heading: {
      levels: [1, 2, 3],
    },
  }),
  CustomImage,
  Emoji.configure({
    suggestion,
  }),
];

// Tiptap editor extensions used to convert between HTML and Prosemirror document state (used internally by tiptap)
export const conversionExtensions = [
  ...commonExtensions,
  Mention.configure({
    HTMLAttributes: {
      class: passportClassName,
    },
  }),
];
