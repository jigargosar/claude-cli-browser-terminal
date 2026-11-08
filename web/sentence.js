// Sentences as Ranges. sentenceAt: the one under a point, so a single click selects it and a quote needs no drag or
// double click. sentencesIn: every one that shows, for the find labels. Intl.Segmenter finds the sentences; in a
// code block each line counts as one.
const BLOCKS = "p, li, td, th, h1, h2, h3, h4, h5, h6, blockquote, dt, dd, pre";
const segmenter = new Intl.Segmenter(undefined, { granularity: "sentence" });

const lines = (text) => {
  const out = [];
  let index = 0;
  for (const segment of text.split("\n")) {
    out.push({ index, segment });
    index += segment.length + 1;
  }
  return out;
};

// The block's own text, without the text of blocks nested in it, such as a sub-list in a list item.
const ownText = (block) => {
  const nodes = [];
  let text = "";
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.parentElement.closest(BLOCKS) !== block) continue;
    nodes.push({ node, start: text.length });
    text += node.data;
  }
  return { nodes, text };
};

const segmentsOf = (block, text) => [...(block.matches("pre") ? lines(text) : segmenter.segment(text))];

// A segment as a Range, its surrounding spaces trimmed. Null for a blank segment.
const rangeOf = (nodes, { index, segment }) => {
  if (!segment.trim()) return null;
  const start = index + (segment.length - segment.trimStart().length);
  const end = index + segment.trimEnd().length;
  // Map a text offset back to its node. An end offset belongs to the node it closes.
  const point = (offset, isEnd) => {
    const n = nodes.findLast((n) => (isEnd ? n.start < offset : n.start <= offset));
    return [n.node, offset - n.start];
  };
  const range = document.createRange();
  range.setStart(...point(start, false));
  range.setEnd(...point(end, true));
  return range;
};

export const sentenceAt = (x, y) => {
  const caret = document.caretPositionFromPoint(x, y);
  if (!caret || caret.offsetNode.nodeType !== Node.TEXT_NODE) return null;
  const block = caret.offsetNode.parentElement.closest(BLOCKS);
  if (!block) return null;
  const { nodes, text } = ownText(block);
  const own = nodes.find((n) => n.node === caret.offsetNode);
  if (!own) return null;
  const at = own.start + caret.offset;
  const all = segmentsOf(block, text);
  // A click on the end of the text belongs to the last segment.
  const hit = all.find((s) => at < s.index + s.segment.length) ?? all.at(-1);
  if (!hit) return null;
  const range = rangeOf(nodes, hit);
  // The caret is the nearest text, however far the click was. Only a click on the sentence's own text picks it.
  const on = range && [...range.getClientRects()].some((r) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom);
  return on ? range : null;
};

// Every sentence in root, in reading order. A closed fold still lays out its content, so its blocks are skipped
// outright.
export const sentencesIn = (root) => {
  const out = [];
  for (const block of root.querySelectorAll(BLOCKS)) {
    if (block.closest("details:not([open])")) continue;
    const { nodes, text } = ownText(block);
    for (const s of segmentsOf(block, text)) {
      const range = rangeOf(nodes, s);
      if (range) out.push(range);
    }
  }
  return out;
};
