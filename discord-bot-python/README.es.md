# Bot de Discord (Python)

[Português (Brasil)](README.md) · [English](README.en.md) · [Español](README.es.md)

Un bot de Discord mínimo en Python, con discord.py 2.7.1 y el comando `/ping`. Es un **template de código**: el código es tuyo, abierto y editable; Vertra ejecuta lo que está en `src/`.

## Qué es

- Inicia sesión con el token del bot, registra el comando de barra `/ping` en cada arranque y responde con la latencia del gateway.
- Solo la intent `Guilds` (sin intent privilegiada para activar en el Portal de Desarrolladores).
- Sin token o con un token incorrecto, el proceso termina con código 1 y un mensaje claro en el log de la app.
- Código fuente en `src/main.py`; dependencias en `src/requirements.txt`.

## Qué pregunta el asistente

| Pregunta | Para qué sirve |
|---|---|
| Token del bot | Se vuelve la variable `DISCORD_TOKEN` (cifrada). Mira el paso 1 abajo para obtenerlo. |

## Qué recibes

- La app (sin dirección web: el bot solo hace conexiones de salida).
- Siguiente paso: invitar al bot a tu servidor y usar `/ping`.

## Primeros pasos

1. En el [Portal de Desarrolladores de Discord](https://discord.com/developers/applications), crea una aplicación, abre **Bot** y usa **Reset Token**; copia el token.
2. Pega el token cuando el asistente lo pregunte.
3. Invita al bot a tu servidor: **OAuth2 > URL Generator**, scopes `bot` y `applications.commands`.
4. Escribe `/ping`. El comando global puede tardar unos minutos en aparecer la primera vez.
5. Para cambiar el bot, edita `src/main.py` (en el editor/archivos de la app o por deploy) y reinicia.

## Límites conocidos

- No tiene página web: el healthcheck es solo el ready-gate (el proceso debe seguir en pie).
- Dos copias con el mismo token responderían por duplicado: el deploy sin downtime queda desactivado.
- El mínimo es 100 MB, y 256 MB (lo recomendado) bastan para un bot simple; bots en muchos servidores o con caché grande piden más (la RAM se puede subir).
- El token vive en una variable cifrada; nunca lo pongas en el código.
- Los comandos globales de Discord tardan en propagarse; para pruebas usa comandos de servidor (guild) en tu código.

## Licencia

El código de este template es de Vertra Cloud, bajo la licencia MIT (ver la `LICENSE` del repositorio). discord.py 2.7.1 se distribuye bajo la licencia MIT: <https://github.com/Rapptz/discord.py/blob/master/LICENSE>.

Más detalles: [docs/first-steps.es.md](docs/first-steps.es.md) · [docs/reference.es.md](docs/reference.es.md)
