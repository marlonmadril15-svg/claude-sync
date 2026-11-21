import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Gasto } from '../types'

// Tu propio panel: qué gasta cada agente, en directo.

const PANEL = 'panel-agentes'
const gastos = atom({ plugin: 'panel-agentes', key: 'gastos' } as const, [], {
  shape: 'gastos-1',
})

const corto = (modelo: string) =>
  /opus/i.test(modelo) ? 'Opus' : /sonnet/i.test(modelo) ? 'Sonnet' : /haiku/i.test(modelo) ? 'Haiku' : modelo

const k = (n: number) => (n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`)

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'panel',
      description: 'Abre el panel con lo que gasta cada agente',
    })

    return next(e)
  })

  on('command.run', { command: 'panel' }, async $ => {
    await $.ui.open({ id: PANEL, title: 'Panel · consumo' })

    return { text: 'Panel de agentes abierto.' }
  })

  // Cada petición al modelo, de la conversación principal o de un subagente.
  on('turn.step', async function* ($, e, next) {
    const r = yield* next(e)
    const u = r.usage
    if (u === null) return r

    const id = e.agentId ?? 'principal'
    const entrada =
      u.input_tokens + u.cache_read_input_tokens + u.cache_creation_input_tokens

    await update($, gastos, lista => {
      const hay = lista.find(g => g.id === id)
      if (hay === undefined) {
        const n = lista.filter(g => g.id !== 'principal').length + 1
        const nuevo: Gasto = {
          id,
          nombre: id === 'principal' ? 'Principal' : `Agente ${n}`,
          modelo: corto(u.model),
          entrada,
          salida: u.output_tokens,
          pasos: 1,
        }
        return [...lista, nuevo].slice(-50)
      }
      return lista.map(g =>
        g.id === id
          ? {
              ...g,
              modelo: corto(u.model),
              entrada: g.entrada + entrada,
              salida: g.salida + u.output_tokens,
              pasos: g.pasos + 1,
            }
          : g,
      )
    })

    return r
  })

  on('ui.render', { component: 'Pane', requestId: PANEL }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const lista = await read($, gastos)
    const total = lista.reduce((s, g) => s + g.entrada + g.salida, 0)

    return (
      <Box flexDirection="column">
        {lista.length === 0 && <Text dimColor>Aún no hay consumo.</Text>}
        {lista.map(g => {
          const parte = total > 0 ? (g.entrada + g.salida) / total : 0
          const barra = '█'.repeat(Math.max(1, Math.round(parte * 20)))
          return (
            <Box flexDirection="column">
              <Text bold>
                {g.nombre} · {g.modelo}
              </Text>
              <Text>
                {barra} {k(g.entrada + g.salida)} ({g.pasos} pasos)
              </Text>
            </Box>
          )
        })}
        {lista.length > 0 && <Text dimColor>Total: {k(total)} tokens</Text>}
      </Box>
    )
  })
}
