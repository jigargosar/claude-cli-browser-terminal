// The phrase grid's entries, in screen order: 6 on the top row, 5 on the bottom. Approved mockup:
// docs/mockups/phrases.html. One key sends the entry's text as the comment; an entry with no text opens the box.
import { Check, CheckCheck, CircleCheck, CircleHelp, MessageSquare, Play, Search, Trash2, VolumeX, Wrench, X } from "lucide";

export const PHRASES = [
  { label: "Fix it", key: "f", icon: Wrench, text: "fix it" },
  { label: "Explain", key: "e", icon: CircleHelp, text: "explain" },
  { label: "Double check", key: "c", icon: CheckCheck, text: "double check" },
  {
    label: "Too noisy",
    key: "t",
    icon: VolumeX,
    text: "too much noise no signal, relevant information is drowned in your response, rephrase.",
  },
  { label: "Remove", key: "x", icon: Trash2, text: "remove" },
  { label: "Research", key: "s", icon: Search, text: "do thorough unbiased research" },
  { label: "Reply", key: "r", icon: MessageSquare },
  { label: "Yes/ok", key: "y", icon: Check, text: "yes/ok" },
  { label: "No/wrong", key: "n", icon: X, text: "no/wrong" },
  { label: "Go ahead", key: "g", icon: Play, text: "go ahead" },
  { label: "Done", key: "d", icon: CircleCheck, text: "done" },
];
