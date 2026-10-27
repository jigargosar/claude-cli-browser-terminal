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

const marked = new Marked(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight: (code, lang) => hljs.highlight(code, { language: hljs.getLanguage(lang) ? lang : "plaintext" }).value,
  }),
  {
    renderer: {
      html: ({ text }) =>
        text.replace(/<\/?([a-zA-Z][\w-]*)[^>]*>/g, (tag, name) => (LIVE_TAGS.has(name.toLowerCase()) ? tag : escapeTag(tag))),
      // A link shows as its text only. A click on a relative link, e.g. `main.js:83`, left the page and lost the
      // comments (docs/plans/data-loss.md).
      link({ tokens }) {
        return this.parser.parseInline(tokens);
      },
    },
  },
);

// To investigate (docs/Board-pending.md): this did not keep the page. The test matches only http(s) hrefs, so a
// relative link such as `web/main.js#L83` got no target and opened in this tab. Commented out while links render as text.
// // Web links open in a new tab, so a click never takes this tab off the session. marked has no extension for it.
// // Setting target after DOMPurify's attribute filter keeps it.
// DOMPurify.addHook("afterSanitizeAttributes", (node) => {
//   if (node.tagName === "A" && /^https?:/.test(node.getAttribute("href"))) {
//     node.setAttribute("target", "_blank");
//     node.setAttribute("rel", "noopener");
//   }
// });

export const render =(md) => DOMPurify.sanitize(marked.parse(md));
