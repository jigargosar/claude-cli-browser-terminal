// probe tests: draw every tab on every surface and print a works/fails matrix.
// A drawing test checks the tree is valid for that app, not how it paints.
import { expect, test } from 'claude-code/testing'

const SURFACES = ['terminal', 'desktop', 'vscode'] as const
// tab id -> the element type that tab exists to test
const TAB_TYPES = { text: 'Text', markdown: 'Markdown', link: 'Link', code: 'Code', diff: 'Code', box: 'Box', button: 'Button', input: 'Input', select: 'Select', raster: 'Raster', svg: 'Svg', signals: 'Button' }
const TAB_IDS = Object.keys(TAB_TYPES)

// What Claude Code passes to a ui.render hook for this pane (from the docs' hello-tabs test)
const PANE = {
  plugin: 'probe',
  component: 'Pane',
  requestId: 'probe',
  viewport: { columns: 100, rows: 30 },
  props: { title: 'Probe', isFocused: true, bodyColumns: 60, placement: 'inline', scroll: { offset: 0, bodyRows: 10 }, view: {} },
} as const

// Stubs every test needs: pane opening and the signal calls
function baseStubs(on, log: string[]) {
  on('ui.open', () => ({ value: { isPlaced: true } }))
  for (const name of ['ui.toast', 'ui.status', 'ui.log'] as const) {
    on(name, ($, e) => { log.push(name + ': ' + e.text); return { value: undefined } })
  }
  // Stands for Claude Code's own drawing when a hook calls next(e); records props it was given
  on('ui.render', ($, e) => {
    log.push('next(' + e.component + ') props: ' + JSON.stringify(e.props))
    return { type: 'engine', ref: 1 }
  })
}

test('matrix: every tab on every surface', async ($, on) => {
  const log: string[] = []
  baseStubs(on, log)
  const rows: string[] = []
  for (const surface of SURFACES) {
    for (const id of TAB_IDS) {
      let result = 'ok'
      try {
        await $.command.run({ command: 'probe', args: id })
        const ui = await $.ui.mount({ ...PANE, surface })
        const marker = await ui.find({ type: 'Text', text: 'surface: ' + surface + ' · tab: ' + id })
        const element = await ui.find({ type: TAB_TYPES[id] })
        if (!marker) result = 'FALLBACK (Claude Code drew its own)'
        else if (!element) result = 'DROPPED (' + TAB_TYPES[id] + ' not drawn on this app)'
        await ui.unmount()
      } catch (err) {
        result = 'ERROR ' + String(err && err.message || err).split('\n')[0]
      }
      rows.push(surface.padEnd(9) + id.padEnd(10) + result)
    }
  }
  console.log('\n' + rows.join('\n'))
  expect(rows.length).toBe(SURFACES.length * TAB_IDS.length)
})

test('signals via /probe args', async ($, on) => {
  const log: string[] = []
  baseStubs(on, log)
  for (const arg of ['toast', 'status', 'log']) await $.command.run({ command: 'probe', args: arg })
  console.log('\n' + log.join('\n'))
  expect(log.length).toBe(3)
})

test('interactions: button, input, select', async ($, on) => {
  const log: string[] = []
  baseStubs(on, log)
  await $.command.run({ command: 'probe', args: 'button' })
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  await ui.press({ key: 'btn-default' })
  expect(await ui.find({ type: 'Text', text: 'Presses: 1' })).toBeDefined()
  await ui.press({ key: 'tab-input' })
  await ui.input({ key: 'field', text: 'hello' })
  expect(await ui.find({ type: 'Text', text: 'Last submitted: hello' })).toBeDefined()
  await ui.press({ key: 'tab-select' })
  await ui.select({ key: 'pick', value: 'html' })
  expect((await ui.find({ key: 'pick' })).props.value).toBe('html')
  await ui.unmount()
})

test('band, spinner, question dialog', async ($, on) => {
  const log: string[] = []
  baseStubs(on, log)
  await $.command.run({ command: 'probe', args: 'band' })
  const out: string[] = []
  for (const surface of SURFACES) {
    for (const component of ['AbovePrompt', 'Spinner', 'AskUserQuestion']) {
      let result = 'ok'
      try {
        // Spinner needs a message prop; the others take empty props here
        const props = component === 'Spinner' ? { message: 'Thinking' } : {}
        const before = log.length
        const ui = await $.ui.mount({ plugin: 'probe', component, requestId: component, viewport: { columns: 100, rows: 30 }, props, surface })
        const mine = await ui.find({ type: 'Text', text: /probe/ })
        const passed = log.slice(before).find((l) => l.includes('suffix'))
        result = mine ? 'ok (probe text drawn)' : passed ? 'ok, passed to Claude Code: ' + passed : 'no probe output'
        await ui.unmount()
      } catch (err) {
        result = 'ERROR ' + String(err && err.message || err).split('\n')[0]
      }
      out.push(surface.padEnd(9) + component.padEnd(16) + result)
    }
  }
  console.log('\n' + out.join('\n'))
  expect(out.every((l) => l.includes(' ok'))).toBe(true)
})
