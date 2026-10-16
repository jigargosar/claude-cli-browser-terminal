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

// Web links open in a new tab, so a click never takes this tab off the session. marked has no extension for it.
// Setting target after DOMPurify's attribute filter keeps it.
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A" && /^https?:/.test(node.getAttribute("href"))) {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener");
  }
});

export const render =(md) => DOMPurify.sanitize(marked.parse(md));
