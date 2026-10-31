# Referencia

| Ítem | Valor |
|---|---|
| Variable | `DISCORD_TOKEN` (cifrada; viene de la pregunta del asistente) |
| Lenguaje | Python (Python, la versión recomendada de la plataforma) |
| Comando de inicio | `python3 -u main.py` |
| Archivo principal | `main.py` |
| RAM | 100 MB (mínima), 256 MB (recomendada) |
| Web | no (solo conexiones de salida) |
| Deploy sin downtime | desactivado (un token = una copia) |

## Problemas comunes

- **`Login failed` en el log.** El valor de `DISCORD_TOKEN` no es el token del bot (Portal > Bot > Reset Token). Actualiza la variable y reinicia.
- **`/ping` no aparece.** Los comandos globales tardan unos minutos; comprueba que la invitación tenía el scope `applications.commands`.
- **La app no se mantiene en pie.** Sin un token válido el proceso sale con código 1; corrige el token y reinicia.
