// Markdown to safe HTML, with highlighted code blocks.
import "@highlightjs/cdn-assets/styles/github-dark.min.css";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "@highlightjs/cdn-assets/es/highlight.min.js";
import DOMPurify from "dompurify";

const marked = new Marked(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight: (code, lang) => hljs.highlight(code, { language: hljs.getLanguage(lang) ? lang : "plaintext" }).value,
  }),
);

export const render = (md) => DOMPurify.sanitize(marked.parse(md));
