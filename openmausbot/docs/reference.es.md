# Referencia

## Dónde queda cada cosa (`/app`, el disco persistente)
| Ruta | Qué es |
|---|---|
| `.openmausbot/` | Conversaciones, bots, rutinas, configuración y sesiones emparejadas. |
| `.claude/`, `.claude.json` | El login de Claude. |
| `.codex/` | El login de Codex. |
| `node_modules/` | Los paquetes (unos 1,2 GB), reinstalados si cambian `package.json` o el lockfile. |

## Variable de la app
| Variable | Para qué sirve |
|---|---|
| `PUBLIC_ORIGIN` | Dirección pública de la app (viene de `{{app.url}}`): enlaces de emparejamiento y verificación de origen. |

El `start.sh` define el resto: datos en `.openmausbot`, `claude` y `codex` en el `PATH`, actualización automática de Claude Code desactivada, edición open source y el puerto 80.

## Problemas comunes
- **No encuentro el código.** Cada inicio imprime uno nuevo; desplázate hasta el último `pairing code` del log, o reinicia la app. Vence en 5 minutos.
- **"Código incorrecto o vencido".** Usa el código del último inicio, una sola vez.
- **La app muestra la configuración del motor en lugar del login.** En *Engines*, abre las opciones avanzadas, elige *Set CLI* e indica `/app/node_modules/.bin/claude` (o `/app/node_modules/.bin/codex`).
- **La app no arranca tras un reinicio.** El `start.sh` ya borra el bloqueo del servidor (`openmausbot-server.lease`) en cada inicio; si persiste, revisa el log.
- **Lenta con muchos bots.** Cada bot activo ejecuta su propio proceso; sube la RAM (3 GB recomendado).
