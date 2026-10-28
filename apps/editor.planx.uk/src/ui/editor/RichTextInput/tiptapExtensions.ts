import Emoji from "@tiptap/extension-emoji";
import Link from "@tiptap/extension-link";
import Mention from "@tiptap/extension-mention";
import StarterKit from "@tiptap/starter-kit";

import CustomImage from "../RichTextImage";
import suggestion from "./components/emoji/suggestion";

export const passportClassName = "passport";

// Drop any class attribute on links (e.g. from content pasted in from external sites)
const CustomLink = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      class: {
        default: null,
        parseHTML: () => null,
      },
    };
  },
}).configure({
  openOnClick: false,
  autolink: false,
});

// Shared tiptap editor extensions
export const commonExtensions = [
  StarterKit.configure({
    link: false,
    // Underline is not offered in the editor toolbar - disabling it strips <u> tags from pasted content
    underline: false,
    heading: {
      levels: [1, 2, 3],
    },
  }),
  CustomLink,
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
