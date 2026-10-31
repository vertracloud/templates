# Evolution API

[Português (Brasil)](README.md) · [English](README.en.md) · [Español](README.es.md)

API de WhatsApp con instancias, webhooks e integraciones. Evolution API v2.3.7 (versión estable; la etiqueta `latest` del proyecto es un pre-lanzamiento) en una imagen de Vertra, con Postgres administrado incluido.

## Qué es

- Varias instancias de WhatsApp (conexión por código QR) con envío y recepción de mensajes por API REST.
- Webhooks e integraciones (Typebot, Chatwoot, Dify, n8n y otras) configurables por instancia.
- Panel de administración en `/manager`.
- Postgres administrado para los datos (mensajes, contactos, instancias) y, si quieres, Redis administrado para la caché. Los archivos de sesión viven en `/app` y entran en los backups.

## Qué pregunta el asistente

| Pregunta | Opciones | Qué cambia |
|---|---|---|
| Caché de Evolution API | Caché local (por defecto) o Redis administrado | Local corre sin Redis. Redis guarda la caché fuera del proceso y usa 512 MB más del plan. |

## Qué recibes

- El **panel** (`<dirección>/manager`).
- La **API key global**, mostrada **una vez**: guárdala. Da acceso a todas las instancias.
- El siguiente paso: abrir el panel, entrar con la API key, crear una instancia y leer el código QR en WhatsApp.

## Primeros pasos

1. Abre `<dirección>/manager` y entra con la **API key global** (las salidas muestran la clave una sola vez).
2. Crea una instancia (un nombre, `WHATSAPP-BAILEYS`) y lee el **código QR** en *WhatsApp > Dispositivos vinculados > Vincular un dispositivo*.
3. Envía un mensaje de prueba por API: `POST <dirección>/message/sendText/<instancia>` con el encabezado `apikey` (la clave de la instancia o la global).
4. Apunta el webhook de la instancia a tu servicio (por ejemplo un flujo de n8n).

## Límites conocidos

- El healthcheck es la ruta `/` (Evolution no tiene `/healthz`).
- El deploy sin downtime queda desactivado: dos copias podrían abrir dos sesiones del mismo WhatsApp y el servidor tumbaría la conexión.
- Un rollback debe volver **con los datos**: Evolution aplica migraciones de la base en cada arranque.
- RAM: 512 MB es el mínimo (Evolution usa ~150-300 MiB); crece con el número de instancias conectadas y el volumen de mensajes (recomendado 1024 MB).
- La conexión por Baileys (WhatsApp Web no oficial) puede ser bloqueada por WhatsApp si se usa para spam: úsala con contactos que dieron su consentimiento.
- Con Redis administrado la conexión usa un certificado de cliente; la imagen trae un pequeño precargado (`vertra-tls-client-cert.cjs`) limitado al host del Redis.

## Licencia

Evolution API se distribuye bajo Apache 2.0 **con condiciones adicionales** (<https://github.com/evolution-foundation/evolution-api/blob/main/LICENSE>): no quites el logo ni el copyright del panel (`/manager`) y, si Evolution forma parte de un proyecto tuyo, muestra un aviso claro de que se usa (por ejemplo en la documentación o en los ajustes). Lee la licencia antes de ofrecerla a terceros. Este template es un empaquetado de Vertra Cloud y no está afiliado al proyecto.

Más detalles: [docs/first-steps.es.md](docs/first-steps.es.md) · [docs/reference.es.md](docs/reference.es.md)
