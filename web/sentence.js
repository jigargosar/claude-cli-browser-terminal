// The sentence under a point, as a Range: a single click selects it, so a quote needs no drag or double click.
// Intl.Segmenter finds the sentences; in a code block each line counts as one.
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

export const sentenceAt = (x, y) => {
  const caret = document.caretPositionFromPoint(x, y);
  if (!caret || caret.offsetNode.nodeType !== Node.TEXT_NODE) return null;
  const block = caret.offsetNode.parentElement.closest(BLOCKS);
  if (!block) return null;

  // The block's own text, without the text of blocks nested in it, such as a sub-list in a list item.
  const nodes = [];
  let text = "";
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.parentElement.closest(BLOCKS) !== block) continue;
    nodes.push({ node, start: text.length });
    text += node.data;
  }
  const own = nodes.find((n) => n.node === caret.offsetNode);
  if (!own) return null;
  const at = own.start + caret.offset;

  const segments = block.matches("pre") ? lines(text) : segmenter.segment(text);
  // A click on the end of the text belongs to the last segment.
  const all = [...segments];
  const hit = all.find((s) => at < s.index + s.segment.length) ?? all.at(-1);
  if (!hit || !hit.segment.trim()) return null;
  const start = hit.index + (hit.segment.length - hit.segment.trimStart().length);
  const end = hit.index + hit.segment.trimEnd().length;

  // Map a text offset back to its node. An end offset belongs to the node it closes.
  const point = (offset, isEnd) => {
    const n = nodes.findLast((n) => (isEnd ? n.start < offset : n.start <= offset));
    return [n.node, offset - n.start];
  };
  const range = document.createRange();
  range.setStart(...point(start, false));
  range.setEnd(...point(end, true));
  // The caret is the nearest text, however far the click was. Only a click on the sentence's own text picks it.
  const on = [...range.getClientRects()].some((r) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom);
  return on ? range : null;
};
