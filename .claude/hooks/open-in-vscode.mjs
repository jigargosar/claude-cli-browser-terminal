// Started in the background by the Stop hook so Claude doesn't wait; failures surface as a Windows toast.
import { spawnSync } from "node:child_process";
import notifier from "node-notifier";

const [file] = process.argv.slice(2);
const result = spawnSync(`code "${file}"`, { shell: true, stdio: ["ignore", "ignore", "pipe"], windowsHide: true });

if (result.status !== 0) {
  const summary = "VS Code: Failed to open Claude CLI response";
  const details = result.stderr.toString().trim() || `code exited with ${result.status}`;
  const reason = details.split("\n")[0];
  const error = `${summary}: ${file}: ${details}`;
  // appID is the notification group name (no Start Menu shortcut registered).
  const toast = {
    appID: "Claude Code Hooks",
    title: summary,
    message: reason,
    icon: `${import.meta.dirname}/error-icon.png`,
    sound: true,
    wait: false,
  };
  notifier.notify(toast, (err) => {
    if (err) throw new Error(`${error}\ntoast failed too: ${err.message}`);
    throw new Error(error);
  });
}
