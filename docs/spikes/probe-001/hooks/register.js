// probe — a test mod. One pane tab per element, so a broken element only breaks its own tab.
// Also tests: band above the prompt, spinner suffix, toast, status line, log line, question dialog.
//
// Commands:
//   /probe            open the pane on the current tab
//   /probe <tab id>   open the pane on that tab (ids are in TABS below)
//   /probe toast | status | log | band   fire that signal without opening the pane

// ---------- State (module variables; reset on every hot reload) ----------
const PANE = 'probe'
let tab = 'text'        // open tab id
let bandOn = false      // band above the prompt on/off
let calls = 0           // tool calls seen, shown in the spinner and band
let typed = ''          // last text submitted in the Input tab
let picked = 'md'       // current choice in the Select tab
let presses = 0         // Button tab press count

// ---------- Raster helper (from the docs gallery) ----------
const DEFAULT_COLOR = 0x01000000
function cellsOf(rows) {
  const numbers = rows.flat().flatMap(([char, color]) => [char.codePointAt(0), color, DEFAULT_COLOR])
  return new Uint8Array(Uint32Array.from(numbers).buffer).toBase64()
}

// ---------- Tabs: add or remove a test by editing this list only ----------
// build(el, act): el = elements from $.ui.resolve(e); act = callbacks made inside the hook.
const TABS = [
  { id: 'text', label: 'Text', hotkey: '1', build: (el) => el.Box({
      flexDirection: 'column',
      children: [
        el.Text({ children: ['Plain text'] }),
        el.Text({ bold: true, children: ['bold'] }),
        el.Text({ italic: true, children: ['italic'] }),
        el.Text({ underline: true, children: ['underline'] }),
        el.Text({ strikethrough: true, children: ['strikethrough'] }),
        el.Text({ dimColor: true, children: ['dimColor'] }),
        el.Text({ inverse: true, children: ['inverse'] }),
        el.Text({ color: 'red', children: ["color: 'red'"] }),
        el.Text({ backgroundColor: 'blue', children: ["backgroundColor: 'blue'"] }),
      ],
    }) },
  { id: 'markdown', label: 'Markdown', hotkey: '2', build: (el) =>
      el.Markdown({ text: '## Heading\n\n**bold**, `code`, [link](https://code.claude.com)\n\n- item one\n- item two\n\n> quote' }) },
  { id: 'link', label: 'Link', hotkey: '3', build: (el) =>
      el.Link({ href: 'https://code.claude.com/docs', label: 'Claude Code docs' }) },
  { id: 'code', label: 'Code', hotkey: '4', build: (el) =>
      el.Code({ language: 'javascript', startLine: 1, source: "const name = 'mods'\nconsole.log('hello ' + name)" }) },
  { id: 'diff', label: 'Diff', hotkey: '5', build: (el) =>
      el.Code({ format: 'diff', source: '@@ -1,3 +1,3 @@\n # Mods\n-A mod is a plugin.\n+A mod is a plugin that runs code.\n Read on.' }) },
  { id: 'box', label: 'Box', hotkey: '6', build: (el) => el.Box({
      flexDirection: 'column',
      gap: 1,
      children: [
        el.Box({ flexDirection: 'row', columnGap: 4, children: ['a row', 'of three', 'items'].map((t) => el.Text({ children: [t] })) }),
        el.Box({ borderStyle: 'round', paddingX: 1, children: [el.Text({ children: ["borderStyle: 'round'"] })] }),
      ],
    }) },
  { id: 'button', label: 'Button', hotkey: '7', build: (el, act) => el.Box({
      flexDirection: 'column',
      children: [
        el.Button({ key: 'btn-default', label: 'Default (press me)', onPress: act.press }),
        el.Button({ key: 'btn-plain', label: 'Plain with hotkey p', hotkey: 'p', plain: true, onPress: act.press }),
        el.Button({ key: 'btn-dim', label: 'Dim', dimColor: true, onPress: act.press }),
        el.Text({ children: ['Presses: ' + presses] }),
      ],
    }) },
  { id: 'input', label: 'Input', hotkey: '8', build: (el, act) => el.Box({
      flexDirection: 'column',
      children: [
        el.Input({ key: 'field', label: 'Type', placeholder: 'Type and press Enter', value: '', submitLabel: 'send', onSubmit: act.submit }),
        el.Text({ children: ['Last submitted: ' + (typed || '(nothing yet)')] }),
      ],
    }) },
  { id: 'select', label: 'Select', hotkey: '9', build: (el, act) =>
      el.Select({
        key: 'pick',
        label: 'Format',
        value: picked,
        options: [
          { value: 'md', label: 'Markdown' },
          { value: 'html', label: 'HTML' },
          { value: 'txt', label: 'Plain text' },
        ],
        onSelect: act.select,
      }) },
  { id: 'raster', label: 'Raster', hotkey: 'r', build: (el) =>
      el.Raster({
        key: 'grid', columns: 3, rows: 2,
        cells: cellsOf([
          [['█', 0x2e7d32], ['█', 0xf9a825], ['█', 0xc62828]],
          [['█', 0x2e7d32], ['█', 0x2e7d32], ['█', 0xf9a825]],
        ]),
      }) },
  { id: 'svg', label: 'Svg', hotkey: 's', build: (el) =>
      el.Svg({
        alt: 'Three bars of rising height', width: 120, height: 60,
        source: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60"><rect x="10" y="40" width="20" height="20" fill="#2e7d32"/><rect x="50" y="25" width="20" height="35" fill="#f9a825"/><rect x="90" y="5" width="20" height="55" fill="#c62828"/></svg>',
      }) },
  { id: 'signals', label: 'Signals', hotkey: 'g', build: (el, act) => el.Box({
      flexDirection: 'column',
      children: [
        el.Button({ key: 'sig-toast', label: 'Toast', onPress: act.toast }),
        el.Button({ key: 'sig-status', label: 'Status line', onPress: act.status }),
        el.Button({ key: 'sig-log', label: 'Log line', onPress: act.log }),
        el.Button({ key: 'sig-band', label: 'Band ' + (bandOn ? 'off' : 'on'), onPress: act.band }),
      ],
    }) },
]
const TAB_IDS = TABS.map((t) => t.id)
const TABS_PER_ROW = 6  // tab buttons per row, so narrow panes don't overflow

export function register(on) {
  // ---------- Setup: register the command ----------
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'probe', description: 'Open the probe test pane', argumentHint: '[tab|toast|status|log|band]', immediate: true })
    return next(e)
  })

  // ---------- /probe ----------
  on('command.run', { command: 'probe' }, async ($, e) => {
    const arg = (e.args || '').trim()
    if (arg === 'toast') { await $.ui.toast('probe toast'); return { text: 'toast sent' } }
    if (arg === 'status') { await $.ui.status('probe status line, calls: ' + calls); return { text: 'status set' } }
    if (arg === 'log') { await $.ui.log('probe log line'); return { text: 'log line sent' } }
    if (arg === 'band') { bandOn = !bandOn; $.ui.invalidate('ui.render'); return { text: 'band ' + (bandOn ? 'on' : 'off') } }
    if (TAB_IDS.includes(arg)) tab = arg
    const placed = await $.ui.open({ id: PANE, title: 'Probe', focus: true, closeOnEscape: true })
    return placed && placed.isPlaced === false ? { text: 'pane waiting: ' + placed.reason } : {}
  })

  // ---------- Count tool calls (feeds spinner and band) ----------
  on('tool.call', async ($, e, next) => {
    calls += 1
    $.ui.invalidate('ui.render')
    return next(e)
  })

  // ---------- Pane: tab rows, blank line, open tab's body ----------
  on('ui.render', { component: 'Pane' }, async ($, e, next) => {
    if (e.requestId !== PANE) return next(e)
    const el = $.ui.resolve(e)
    const redraw = () => $.ui.invalidate('ui.render')
    // Callbacks for the tab bodies (kept here so every $ call is written in full)
    const act = {
      press: () => { presses += 1; redraw() },
      submit: (value) => { typed = value; redraw() },
      select: (value) => { picked = value; redraw() },
      toast: () => $.ui.toast('probe toast'),
      status: () => $.ui.status('probe status line, calls: ' + calls),
      log: () => $.ui.log('probe log line'),
      band: () => { bandOn = !bandOn; redraw() },
    }
    const tabButton = (t) => el.Button({
      key: 'tab-' + t.id, label: t.label, hotkey: t.hotkey, plain: true,
      dimColor: tab !== t.id,
      onPress: () => { tab = t.id; redraw() },
    })
    const rows = []
    for (let i = 0; i < TABS.length; i += TABS_PER_ROW) {
      rows.push(el.Box({ flexDirection: 'row', columnGap: 2, children: TABS.slice(i, i + TABS_PER_ROW).map(tabButton) }))
    }
    const current = TABS.find((t) => t.id === tab) || TABS[0]
    return el.Box({
      flexDirection: 'column',
      children: [
        ...rows,
        el.Text({ dimColor: true, children: ['surface: ' + e.surface + ' · tab: ' + current.id] }),
        el.Text({ children: [' '] }),
        current.build(el, act),
      ],
    })
  })

  // ---------- Band above the prompt (toggle with /probe band) ----------
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (!bandOn) return next(e)
    const { Text } = $.ui.resolve(e)
    return Text({ color: 'cyan', children: ['probe band · tool calls: ' + calls] })
  })

  // ---------- Spinner: keep Claude Code's, add a suffix ----------
  on('ui.render', { component: 'Spinner' }, async ($, e, next) => {
    return next({ ...e, props: { ...e.props, suffix: ' · probe: ' + calls + ' tool calls…' } })
  })

  // ---------- Question dialog: a line above Claude Code's own dialog ----------
  on('ui.render', { component: 'AskUserQuestion' }, async ($, e, next) => {
    const { Box, Text } = $.ui.resolve(e)
    const theirs = await next(e)
    return Box({ flexDirection: 'column', children: [Text({ color: 'magenta', children: ['probe: drawn above the question'] }), theirs] })
  })
}
