// A stand-in project file for the test page. File references in test/page/transcript.jsonl point at its lines.
const settings = {
  title: "Stand-in app",
  width: 800,
  height: 600,
};

const readSettings = () => settings;

const openWindow = ({ title, width, height }) => `${title} at ${width}x${height}`;

const start = () => {
  const loaded = readSettings();
  return openWindow(loaded);
};

const stop = () => "stopped";

const restart = () => {
  stop();
  return start();
};

export { restart, start, stop };
