// Markdown to safe HTML, with highlighted code blocks.
import "@highlightjs/cdn-assets/styles/github-dark.min.css";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "@highlightjs/cdn-assets/es/highlight.min.js";
import DOMPurify from "dompurify";

// Raw HTML in a reply shows as text, so `Promise<T>` or `<placeholder>` in prose stays visible. Only the tags that
// let a reply fold or shrink its carried-forward points stay live.
const LIVE_TAGS = new Set(["details", "summary", "small"]);
const escapeTag = (tag) => tag.replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const highlight = (code, lang) => hljs.highlight(code, { language: hljs.getLanguage(lang) ? lang : "plaintext" }).value;
// For attribute values the renderer writes itself.
const attr = (text) => text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const marked = new Marked(
  markedHighlight({ langPrefix: "hljs language-", highlight }),
  {
    renderer: {
      html: ({ text }) =>
        text.replace(/<\/?([a-zA-Z][\w-]*)[^>]*>/g, (tag, name) => (LIVE_TAGS.has(name.toLowerCase()) ? tag : escapeTag(tag))),
      // A web link opens in a new tab (the hook below). Any other link is a file reference, e.g. `web/main.js#L83`: a span
      // that web/refs.js resolves, never an href, so a click cannot take this tab off the session.
      link({ href, tokens }) {
        const text = this.parser.parseInline(tokens);
        return /^https?:/i.test(href) ? `<a href="${attr(href)}">${text}</a>` : `<span class="file-ref" data-ref="${attr(href)}">${text}</span>`;
      },
    },
  },
);

// Every link left is a web link. marked has no extension for the target. Setting it after DOMPurify's attribute filter
// keeps it.
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A") {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener");
  }
});

export const render =(md) => DOMPurify.sanitize(marked.parse(md));
