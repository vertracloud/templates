# Open WebUI

[Português (Brasil)](README.md) · [English](README.en.md) · [Español](README.es.md)

Interfaz de chat con IA para tu equipo. Open WebUI v0.12.4 (variante `slim`) en una imagen de Vertra que mantiene el programa fuera de `/app` y los datos en `/app/data`. **Tú traes la clave del modelo**: Vertra no aloja modelos.

## Qué es

- Chat con los modelos de tu proveedor, historial, carpetas, prompts y herramientas.
- Cuentas de usuario con administrador creado en el deploy y **registro abierto desactivado**.
- Variante `slim`: sin modelo de embeddings, de voz ni Ollama embebidos. Los archivos adjuntos entran enteros al contexto (la búsqueda por embeddings queda desactivada).
- Datos en SQLite en el disco de la app o en Postgres administrado (con certificado de cliente).
- No se abre dentro de otra página (`X-Frame-Options: DENY` y `frame-ancestors 'none'`): la vista previa del panel de Vertra muestra la tarjeta "abrir en una pestaña nueva".

## Qué pregunta el asistente

| Pregunta | Para qué sirve |
|---|---|
| Proveedor de modelo | OpenAI, OpenRouter, Anthropic, Google Gemini (todos por la API compatible con OpenAI) u otra dirección. |
| Dirección de la API | Solo con "Otro": termina en `/v1`. |
| Clave de API del proveedor | Solo en las variables cifradas de la app. |
| Correo y contraseña del administrador | La cuenta de administrador ya nace lista; el registro abierto queda desactivado. |
| ¿Dónde guarda Open WebUI los datos? | **SQLite** en el disco de la app (por defecto, para uso personal o equipo pequeño) o **Postgres administrado** (+1 GB de RAM). |

## Qué recibes

- La **dirección** de la app.
- El siguiente paso: entrar con el correo y la contraseña de administrador que indicaste.

## Primeros pasos

1. Abre la dirección y entra con el correo y la contraseña de administrador del asistente.
2. Los modelos del proveedor aparecen solos en el selector. Conversa.
3. Para crear más cuentas: *Panel de administración > Usuarios* (el registro abierto está desactivado).
4. Para cambiar de proveedor o sumar otro: *Ajustes de administrador > Conexiones*.

## Límites conocidos

- RAM: 512 MB es el mínimo (~300 MiB en uso; arranque 10-30 s); 1 GB es margen para adjuntos y varias personas.
- No hay embeddings locales: el *RAG* con búsqueda semántica no está disponible; los adjuntos van enteros al contexto del modelo.
- El deploy sin downtime queda desactivado (la copia nueva migra la base mientras la anterior aún atiende). El rollback vuelve **con los datos**.
- La marca Open WebUI no puede alterarse (ver Licencia).
- `WEBUI_SECRET_KEY` firma los logins: cambiarla desconecta a todos.
- Las llamadas a proveedores no se ejercitaron con una clave real; solo el encadenamiento con un servidor compatible local.

## Licencia

Open WebUI se distribuye bajo la licencia BSD-3 **con cláusula de marca** (copia en `docker/LICENSE`): <https://github.com/open-webui/open-webui/blob/main/LICENSE>. La marca "Open WebUI" (nombre, logo e identificadores visuales) **no puede alterarse, quitarse ni ocultarse**, salvo en despliegues con hasta 50 usuarios finales en 30 días, con permiso escrito del titular o licencia enterprise. Este template no cambia la marca. El ícono es el del proyecto, sin cambios (`ICONS.md`). Empaquetado de Vertra Cloud, no afiliado al proyecto.

Más detalles: [docs/first-steps.es.md](docs/first-steps.es.md) · [docs/reference.es.md](docs/reference.es.md)
