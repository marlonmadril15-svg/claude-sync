import type { Register } from 'claude-code'

// El Portero: lo fácil al modelo que gasta menos (Haiku), lo difícil al caro.
// Solo decide el modelo de los subagentes nuevos: cambiar el modelo de la
// conversación principal obligaría a releer todo sin caché, y no compensa.

const FACIL =
  /\b(busca|buscar|encuentra|encontrar|localiza|lista|listar|lee|leer|resume|resumir|resumen|explora|explorar|search|find|locate|list|read|summari[sz]e|summary|grep|look ?up|explore)\b/i
const DIFICIL =
  /\b(planea|planifica|plan|diseña|diseñar|arquitectura|refactoriza|depura|debug|revisa|review|audita|audit|implementa|implement|architect|design)\b/i

export const register: Register = on => {
  on('agent.spawn', async ($, e, next) => {
    // Respeta un modelo pedido a propósito, y los forks (que siempre heredan).
    if (e.model !== undefined || e.subagentType === 'fork') return next(e)

    const tarea = `${e.description} ${e.prompt.slice(0, 400)}`
    const esFacil =
      e.subagentType === 'Explore' || (FACIL.test(tarea) && !DIFICIL.test(tarea))
    if (!esFacil) return next(e)

    $.ui.toast(`Portero: "${e.description}" → Haiku (tarea fácil)`)

    return next({ ...e, model: 'haiku' })
  }).catch(($, e, next) => next(e))
}
