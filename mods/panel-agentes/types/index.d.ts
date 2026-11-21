export type Gasto = {
  id: string
  nombre: string
  modelo: string
  entrada: number
  salida: number
  pasos: number
}

declare module 'claude-code' {
  interface PluginState {
    'panel-agentes': { gastos: Shaped<Gasto[]> }
  }
}
