import Bold from "@tiptap/extension-bold";
import BulletList from "@tiptap/extension-bullet-list";
import Document from "@tiptap/extension-document";
import HardBreak from "@tiptap/extension-hard-break";
import Heading from "@tiptap/extension-heading";
import Italic from "@tiptap/extension-italic";
import Link from "@tiptap/extension-link";
import ListItem from "@tiptap/extension-list-item";
import Mention from "@tiptap/extension-mention";
import OrderedList from "@tiptap/extension-ordered-list";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";

import CustomImage from "../RichTextImage";

export const passportClassName = "passport";

// Shared tiptap editor extensions
export const commonExtensions = [
  Document,
  Paragraph,
  Text,
  Bold,
  Italic,
  HardBreak,
  Link.configure({
    openOnClick: false,
    autolink: false,
  }),
  Heading.configure({
    levels: [1, 2, 3],
  }),
  BulletList,
  OrderedList,
  ListItem,
  CustomImage,
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
