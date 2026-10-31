# Primeros pasos

1. **Entra.** Abre la dirección y usa el correo y la contraseña de administrador del asistente. `WEBUI_ADMIN_PASSWORD` solo crea la cuenta mientras no exista ningún usuario; después cambia la contraseña en *Perfil > Contraseña*.
2. **Conversa.** Los modelos del proveedor aparecen en el selector en la parte superior del chat.
3. **Invita al equipo.** *Panel de administración > Usuarios > Agregar*. El registro abierto está desactivado (`ENABLE_SIGNUP=false`).
4. **Cambia o suma proveedores.** *Ajustes de administrador > Conexiones*: cualquier API compatible con OpenAI (OpenRouter, Anthropic y Gemini por sus rutas compatibles, o tu propio servidor).
5. **Adjuntos.** Sin embeddings locales, el archivo adjunto entero entra al contexto: usa archivos pequeños o modelos de contexto largo.

## Datos y backup
Con SQLite, la base es `/app/data/webui.db` y entra en los snapshots de la app. Con Postgres administrado, los datos viven en la base de la stack. El rollback vuelve con los datos.
