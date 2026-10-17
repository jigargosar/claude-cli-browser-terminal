# Research: one key per mode

Question: can one key switch straight to a mode (default, accept edits, plan), instead of cycling with Shift+Tab?
Source: Claude Code's keybinding list (keybindings.json format). 2026-10-17.

## Facts

1. No action sets a specific mode.
2. Mode actions only cycle: `chat:cycleMode` (Shift+Tab, prompt), `confirm:cycleMode` (Shift+Tab, permission dialog).

## Idea

1. The page maps one key per mode and sends N Shift+Tabs to reach it.
2. That needs the current mode.

## Unverified

1. The current mode may be readable from the terminal footer text ("accept edits on", "plan mode on").
2. The current mode may be in the transcript.
3. The order Shift+Tab cycles through the modes.

## Related facts (traversal task)

1. Tab completion is `autocomplete:accept` (Tab, Autocomplete context). Rebindable.
2. Claude also uses Tab for: `confirm:nextField` (permission dialogs), `tabs:next`, `historySearch:accept` (Ctrl+R), `effortSlider:toggleUltracode`.
3. Ctrl+X Ctrl+S and Ctrl+Enter are `chat:sendNow`. Ctrl+X Enter is `chat:queueSubmit`.
4. Ctrl+I can't be rebound: terminals send the same byte as Tab.
5. To move a binding: set the old key to `null` and add the new key.
