import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Activity, Made, Step } from '../types'

const PANE = 'smoothstep-ueberblick'
const TITLE = 'SmoothStep Überblick'
const TAFEL = 'https://claude.ai/artifact/GLNixmepknQHbWFWRw97FW'
const GITHUB = 'https://github.com/lucasdrobnitza305-tech/Smoothstep'

const activity = atom({ plugin: 'smoothstep-ueberblick', key: 'activity' } as const, { isBusy: false, label: '' } as Activity, { shape: 'activity-1' })
const steps = atom({ plugin: 'smoothstep-ueberblick', key: 'steps' } as const, [] as Step[], { shape: 'steps-1' })
const made = atom({ plugin: 'smoothstep-ueberblick', key: 'made' } as const, [] as Made[], { shape: 'made-1' })
const changed = atom({ plugin: 'smoothstep-ueberblick', key: 'changed' } as const, [] as string[], { shape: 'changed-1' })

// Was Claude gerade tut, in einfachen Worten
function describe(tool: string): string {
  if (tool === 'Read' || tool === 'Glob' || tool === 'Grep') return 'liest Dateien'
  if (tool === 'Write' || tool === 'Edit' || tool === 'NotebookEdit') return 'schreibt Code'
  if (tool === 'Bash') return 'führt einen Befehl aus'
  if (tool === 'WebSearch' || tool === 'WebFetch') return 'sucht im Internet'
  if (tool === 'Artifact') return 'baut eine Seite'
  if (tool === 'ArtifactData') return 'aktualisiert die Tafel'
  if (tool === 'Skill' || tool === 'ToolSearch') return 'liest eine Anleitung'
  if (tool === 'Agent') return 'schickt einen Helfer los'
  if (tool.startsWith('Task')) return 'plant die Schritte'
  if (tool === 'Projects') return 'liest Projektdokumente'
  if (tool === 'SendUserFile') return 'schickt dir eine Datei'
  if (tool.includes('computer')) return 'schaut auf deinen Bildschirm'
  if (tool.includes('Claude_Browser') || tool.includes('claude-in-chrome')) return 'arbeitet im Browser'
  if (tool.includes('device_commit')) return 'legt Dateien auf deinen PC'
  if (tool.includes('remote-devices')) return 'arbeitet mit deinem PC'
  if (tool.includes('memory')) return 'schaut in die Notizen'
  if (tool.includes('Claude_Docs')) return 'schreibt ein Dokument'
  return 'arbeitet'
}

function fileName(path: string): string {
  const parts = path.split(/[\\/]/)
  return parts[parts.length - 1] || path
}

// Pfad relativ zum Projektordner, oder undefined, wenn die Datei nicht ins Projekt-Git gehört
function inProject(path: string, cwd: string): string | undefined {
  const norm = (p: string) => p.replace(/\\/g, '/').replace(/\/+$/, '')
  const file = norm(path)
  const root = norm(cwd)
  if (!file.toLowerCase().startsWith(root.toLowerCase() + '/')) return undefined
  const rel = file.slice(root.length + 1)
  if (/^(node_modules|\.expo|\.git)\//.test(rel)) return undefined
  return rel
}

// Die Aufgabenliste der Desktop-App (update_plan) in unsere Schritte übersetzen
function applyPlan(list: Step[], input: Record<string, unknown>): Step[] {
  if (Array.isArray(input.items)) {
    return (input.items as Array<Record<string, unknown>>).map((item, i) => ({
      id: String(i + 1),
      title: String(item.content ?? 'Schritt'),
      status: item.status === 'in_progress' || item.status === 'completed' ? item.status : 'pending',
    }))
  }
  let next = list
  const set = (nr: number, status: Step['status']) => {
    next = next.map((s, i) => (i === nr - 1 ? { ...s, status } : s))
  }
  if (Array.isArray(input.done)) for (const nr of input.done) if (typeof nr === 'number') set(nr, 'completed')
  if (typeof input.start === 'number') set(input.start, 'in_progress')
  if (input.advance === true) {
    const cur = next.findIndex(s => s.status === 'in_progress')
    if (cur >= 0) set(cur + 1, 'completed')
    const pending = next.findIndex(s => s.status === 'pending')
    if (pending >= 0) set(pending + 1, 'in_progress')
  }
  return next
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'ueberblick', description: 'Öffnet das SmoothStep-Überblick-Panel' })
    void $.ui.open({ id: PANE, title: TITLE })
    return next(e)
  })

  on('command.run', { command: 'ueberblick' }, async $ => {
    const { isPlaced } = await $.ui.open({ id: PANE, title: TITLE })
    return {
      text: isPlaced
        ? 'Überblick geöffnet – das Panel steht neben dem Chat.'
        : 'Das Panel ist bereit, aber diese Ansicht zeigt gerade keine Seitenleiste an. Probier es in der Claude-Desktop-App oder in einem breiteren Fenster.',
    }
  })

  on('prompt.submit', async ($, e, next) => {
    await update($, activity, () => ({ isBusy: true, label: 'denkt nach' }))
    return next(e)
  }).catch(($, e, next) => next(e))

  on('turn.complete', async ($, e, next) => {
    await update($, activity, () => ({ isBusy: false, label: '' }))
    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    const tool = String(e.tool)
    const input = e as unknown as Record<string, unknown>
    await update($, activity, () => ({ isBusy: true, label: describe(tool) }))

    const ran = await next(e)
    const ok = ran.deny === undefined && ran.isError !== true
    const text = typeof ran.text === 'string' ? ran.text : ''

    if (ok && tool === 'TaskCreate') {
      const id = (text.match(/#?(\d+)/) || [])[1]
      const title = String(input.subject ?? 'Schritt')
      if (id) await update($, steps, list => [...list.filter(s => s.id !== id), { id, title, status: 'pending' as const }].slice(-30))
    }

    if (ok && tool === 'TaskUpdate') {
      const id = String(input.taskId ?? '')
      const status = input.status
      await update($, steps, list =>
        status === 'deleted'
          ? list.filter(s => s.id !== id)
          : list.map(s =>
              s.id === id
                ? {
                    ...s,
                    title: typeof input.subject === 'string' ? input.subject : s.title,
                    status: status === 'in_progress' || status === 'completed' || status === 'pending' ? status : s.status,
                  }
                : s,
            ),
      )
    }

    if (ok && tool === 'Artifact') {
      const url = (text.match(/https:\/\/claude\.ai\/(?:code\/)?artifact\/[A-Za-z0-9-]+/) || [])[0]
      if (url) {
        const path = typeof input.file_path === 'string' ? input.file_path : ''
        const title = typeof input.title === 'string' ? input.title : fileName(path).replace(/\.(html|md)$/, '') || 'Seite'
        await update($, made, list => [{ title, url }, ...list.filter(m => m.url !== url)].slice(0, 8))
      }
    }

    if (ok && tool === 'mcp__ccd_turn__update_plan') {
      await update($, steps, list => applyPlan(list, input))
    }

    // wrap_up hakt die Aufgabenliste der App ab
    if (ok && tool === 'mcp__ccd_turn__wrap_up') {
      await update($, steps, list => list.map(s => ({ ...s, status: 'completed' as const })))
    }

    if (ok && (tool === 'Write' || tool === 'Edit' || tool === 'NotebookEdit')) {
      const path = String(input.file_path ?? input.notebook_path ?? '')
      const rel = path ? inProject(path, await $.session.cwd()) : undefined
      if (rel) await update($, changed, list => [...new Set([...list, rel])].slice(-40))
    }

    // Nach einem erfolgreichen git commit ist alles gesichert
    if (ok && tool === 'Bash' && /\bgit\s+commit\b/.test(String(input.command ?? ''))) {
      await update($, changed, () => [])
    }

    if (ok && tool.includes('device_commit_files')) {
      const files = Array.isArray(input.files) ? (input.files as Array<Record<string, unknown>>) : []
      const names = files.map(f => fileName(String(f.devicePath ?? ''))).filter(Boolean)
      if (names.length) await update($, changed, list => [...new Set([...list, ...names])].slice(-40))
    }

    await update($, activity, a => (a.isBusy ? { isBusy: true, label: 'denkt nach' } : a))
    return ran
  }).catch(($, e, next) => next(e))

  // Kurzfassung als Band über dem Eingabefeld – für Ansichten ohne Seitenleiste
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e)
    const { Box, Text, Link } = $.ui.resolve(e)
    const act = await read($, activity)
    const list = await read($, steps)
    const files = await read($, changed)
    const done = list.filter(s => s.status === 'completed').length
    const now = list.find(s => s.status === 'in_progress')

    return (
      <Box flexDirection="row" flexWrap="wrap" columnGap="md" rowGap="xs" alignItems="center">
        {act.isBusy ? (
          <Text color="claude" weight="medium">● Claude {act.label} …</Text>
        ) : (
          <Text color="success" weight="medium">✓ Wartet auf dich</Text>
        )}
        {list.length > 0 && (
          <Text dimColor>
            Schritte {done}/{list.length}{now ? ` · jetzt: ${now.title}` : ''}
          </Text>
        )}
        {files.length > 0 ? (
          <Text color="warning">{files.length} {files.length === 1 ? 'Datei' : 'Dateien'} nicht mit Git gesichert</Text>
        ) : (
          <Text dimColor>Git: alles gesichert</Text>
        )}
        <Link href={TAFEL} label="↗ Tafel" />
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button, Link } = $.ui.resolve(e)
    const act = await read($, activity)
    const list = await read($, steps)
    const items = await read($, made)
    const files = await read($, changed)

    const done = list.filter(s => s.status === 'completed').length
    const mark = (s: Step) => (s.status === 'completed' ? '✓' : s.status === 'in_progress' ? '◐' : '○')

    return (
      <Box flexDirection="column" gap="md" padding="xs">
        <Box flexDirection="column" gap="xs">
          <Text size="footnote" weight="semibold" dimColor>GERADE</Text>
          {act.isBusy ? (
            <Text color="claude" weight="medium">● Claude {act.label} …</Text>
          ) : (
            <Text color="success" weight="medium">✓ Fertig – wartet auf dich</Text>
          )}
        </Box>

        <Box flexDirection="column" gap="xs">
          <Text size="footnote" weight="semibold" dimColor>
            SCHRITTE IN DIESEM CHAT{list.length ? ` · ${done} von ${list.length}` : ''}
          </Text>
          {list.length === 0 && <Text dimColor>Noch keine Schritte geplant.</Text>}
          {list.map(s => (
            <Text dimColor={s.status === 'completed'} color={s.status === 'in_progress' ? 'claude' : undefined}>
              {mark(s)} {s.title}
            </Text>
          ))}
        </Box>

        <Box flexDirection="column" gap="xs">
          <Text size="footnote" weight="semibold" dimColor>ERSTELLT</Text>
          {items.length === 0 && <Text dimColor>Noch nichts in diesem Chat.</Text>}
          {items.map(m => (
            <Link href={m.url} label={`↗ ${m.title}`} />
          ))}
        </Box>

        <Box flexDirection="column" gap="xs">
          <Text size="footnote" weight="semibold" dimColor>AUF DEINEM PC GEÄNDERT</Text>
          {files.length === 0 ? (
            <Text dimColor>Alles gesichert.</Text>
          ) : (
            <Box flexDirection="column" gap="xs">
              <Text color="warning" weight="medium">
                {files.length} {files.length === 1 ? 'Datei' : 'Dateien'} noch nicht mit Git gesichert
              </Text>
              {files.slice(-6).map(f => (
                <Text dimColor>· {f}</Text>
              ))}
              {files.length > 6 && <Text dimColor>· und {files.length - 6} weitere</Text>}
              <Text dimColor>Im Projektordner eingeben:</Text>
              <Text mono>git add .</Text>
              <Text mono>git commit -m "Beschreibung"</Text>
              <Text mono>git push</Text>
              <Button key="gesichert" label="Ich habe gesichert" onPress={() => update($, changed, () => [])} />
            </Box>
          )}
        </Box>

        <Box flexDirection="column" gap="xs">
          <Text size="footnote" weight="semibold" dimColor>SCHNELLZUGRIFF</Text>
          <Link href={TAFEL} label="↗ SmoothStep Tafel" />
          <Link href={GITHUB} label="↗ Code auf GitHub" />
        </Box>
      </Box>
    )
  })
}
