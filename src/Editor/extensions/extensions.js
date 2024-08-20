import Placeholder from "@tiptap/extension-placeholder";
import Document from "@tiptap/extension-document";

import Link from "@tiptap/extension-link";

import Cite from "./CustomExtensions/Cite";

import Iframe from "./CustomExtensions/Iframe/Iframe";
import Gapcursor from "@tiptap/extension-gapcursor";
import Youtube from "@tiptap/extension-youtube";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Text from "@tiptap/extension-text";
import Heading from "@tiptap/extension-heading";
import Paragraph from "@tiptap/extension-paragraph";
import CodeBlock from "@tiptap/extension-code-block";
import Bold from "@tiptap/extension-bold";
import HardBreak from "@tiptap/extension-hard-break";
import Underline from "@tiptap/extension-underline";
import Italic from "@tiptap/extension-italic";
import ListItem from "@tiptap/extension-list-item";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import Dropcursor from "@tiptap/extension-dropcursor";
import History from "@tiptap/extension-history";
import { Blockquote } from "./CustomExtensions/CustomBlockquote";
import { Image } from "./CustomExtensions/Figure2/CustomImage";

import Figure from "./CustomExtensions/Figure2/Figure";
import FigCaption from "./CustomExtensions/Figure2/Figcaption";
import { PasteFilter } from "./CustomExtensions/PasteFilter";

import Tweet from "./CustomExtensions/Tweet/Tweet";
import LinkEmbed from "./CustomExtensions/LinkEmbed/LinkEmbed";
import Video from "./CustomExtensions/Video/Video";


export const extensions = ({postType})=> [
  // CustomDocument,
  //if postType is article, then the document should start with a heading
  Document.extend({
    content: postType == "article" ? "heading block*" : "block*",
    atom: true,
  }),
  Text,
  History,
  Paragraph,
  Heading,
  Tweet,
  CodeBlock,
  HorizontalRule,
  Bold,
  HardBreak,
  Underline,
  Italic,
  ListItem,
  Gapcursor,
  BulletList,
  OrderedList,
  Dropcursor,
  Cite,
  Video,
  Iframe,
  Youtube,
  Blockquote,
  LinkEmbed,
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      target: "_blank",
      rel: null,
      class: null,
    },
  }),

  // images are converted to figures now
  Figure,
  Image.configure({
    allowBase64: true,
  }),
  FigCaption,
  PasteFilter,
  // Figure.configure({
  //   allowBase64: true,
  // }),
  Placeholder.configure({
    showOnlyCurrent: false,
    includeChildren: false,
    placeholder: ({ editor, node }) => {
      if (node.type.name === "heading") {
        return "Title";
      }
      if (node.type.name === "figcaption") {
        return "Enter a caption";
      }
      if (node.type.name === "figure") {
        return "Enter a caption";
      }
      if (node.type.name === "tweet") {
        return "Paste a tweet link and press enter";
      }
      if (node.type.name == "paragraph") {
        //check if editor has 3 or more nodes
        if (
          editor.state.doc.textContent.trim() === "" &&
          editor.state.doc.childCount <= 2
        ) {
          return "Tell your story...";
        }
      }
    },
  }),
];
