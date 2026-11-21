import type { Register } from 'claude-code'

// El Vigilante: avisa cuando la caché de la conversación se enfría.
// La caché de prompts dura ~5 minutos sin uso. Pasado eso, el siguiente
// mensaje (aunque sea un "hola") relee todo el contexto sin caché.

const TTL_MS = 5 * 60 * 1000
const MINIMO_TOKENS = 20_000

let ultimaRespuesta: number | undefined
let temporizador: { cancel: () => void } | undefined

const miles = (n: number) => n.toLocaleString('es-ES')

export const register: Register = on => {
  // Al acabar cada turno de la conversación principal, la caché está caliente.
  on('turn.complete', async ($, e, next) => {
    const r = await next(e)
    if (e.agentId !== undefined) return r

    ultimaRespuesta = await $.clock.now()
    $.ui.status(undefined)
    temporizador?.cancel()
    temporizador = $.clock.after(TTL_MS, async () => {
      const tokens = (await $.session.usage()).context.tokens ?? 0
      if (tokens < MINIMO_TOKENS) return
      $.ui.status(`Vigilante: caché fría (${miles(tokens)} tokens)`)
      $.ui.toast(
        `Vigilante: la caché se enfrió. Tu próximo mensaje releerá ${miles(tokens)} tokens sin caché. Si cambias de tema, usa /clear o /compact.`,
        { timeoutMs: 10000 },
      )
    })

    return r
  })

  // Al enviar un mensaje con la caché ya fría, avisa de lo que costará.
  on('prompt.submit', async ($, e, next) => {
    if (ultimaRespuesta === undefined || e.command || e.isMeta) return next(e)

    const pasado = (await $.clock.now()) - ultimaRespuesta
    if (pasado < TTL_MS) return next(e)

    const tokens = (await $.session.usage()).context.tokens ?? 0
    if (tokens >= MINIMO_TOKENS) {
      const min = Math.round(pasado / 60000)
      $.ui.toast(
        `AVISO: este mensaje relee ${miles(tokens)} tokens sin caché (llevas ${min} min sin escribir).`,
        { timeoutMs: 8000 },
      )
    }

    return next(e)
  }).catch(($, e, next) => (next.called ? next(e) : next(e)))
}
