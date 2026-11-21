# Mis skills y mods de Claude Code

Aquí guardo mis skills y mods de Claude Code, para tenerlos en cualquier laptop sin volver a descargarlos.

## Qué hay

| Tipo | Nombre | Qué hace |
| --- | --- | --- |
| Skill | `find-skills` | Busca e instala skills del directorio skills.sh (`npx skills find ...`). Necesita Node.js. |
| Mod | `portero` | Lo fácil, al modelo barato: los subagentes con tareas simples (buscar, leer, resumir) corren en Haiku. Lo difícil queda en el modelo caro. Nunca cambia el modelo de la conversación principal, porque perdería la caché. |
| Mod | `vigilante` | Avisa cuando la caché se enfría (5 min sin escribir) y tu próximo mensaje va a releer todo el contexto sin caché. |
| Mod | `panel-agentes` | Panel en vivo de lo que gasta cada agente (modelo, tokens, pasos). Se abre con `/panel`. |

## Instalar en otra laptop

1. Instala Git y GitHub CLI, e inicia sesión: `gh auth login` y después `gh auth setup-git`.
2. Clona el repo: `gh repo clone marlonmadril15-svg/claude-sync`
3. Dentro de la carpeta: `powershell -ExecutionPolicy Bypass -File .\instalar.ps1`
4. Reinicia Claude.

## Guardar skills nuevas

Cuando instales skills nuevas en cualquier laptop: `powershell -ExecutionPolicy Bypass -File .\guardar.ps1`

En la otra laptop: `git pull` y luego `.\instalar.ps1` otra vez.
