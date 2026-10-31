# OpenClaw

[Português (Brasil)](README.md) · [English](README.en.md) · [Español](README.es.md)

Un asistente de IA personal con navegador, panel y canales de mensajería. OpenClaw 2026.10.7 como proyecto de código en el runtime Node 24 de Vertra (el paquete `openclaw` de npm, fijado en `package-lock.json`; Chromium viene del runtime). Tú traes la clave del modelo: Vertra no aloja modelos.

## Qué es

- **Panel (Control UI)** en la dirección de la app, protegido por el token del gateway.
- **Navegador del agente** (opcional, activado por defecto): Chromium headless dentro del contenedor, para que el asistente abra, lea y complete páginas.
- **Terminal del panel** activada (un shell del propio contenedor, sin privilegios nuevos).
- **Proveedores**: OpenAI, Anthropic, Google Gemini, OpenRouter y endpoint compatible; decenas más desde el panel (Configuración > Modelos).
- **Canales**: Telegram, Discord y Slack activados en el primer arranque; WhatsApp por QR en el panel.
- Programaciones (cron), skills y voz son parte de OpenClaw; la voz depende del micrófono de tu navegador y de un proveedor de voz.

## Qué pregunta el asistente

| Pregunta | Para qué sirve |
|---|---|
| Proveedor de modelo | OpenAI, Anthropic, Google Gemini, OpenRouter o endpoint compatible con OpenAI. |
| Clave de API del proveedor | Guardada solo en las variables cifradas de la app. OpenClaw arranca incluso con una clave inválida; solo se usa cuando el asistente responde. |
| URL base del endpoint | Solo con endpoint compatible: termina en `/v1`. |
| Modelo (opcional) | Vacío = el predeterminado del proveedor. Obligatorio con endpoint compatible. En OpenRouter sirve cualquier id (también `:free`). |
| ¿El asistente puede usar un navegador? | Sí (por defecto): Chromium dentro de la app, 3 GB de RAM como mínimo. No: solo texto, 2 GB. Vale en el primer arranque. |
| Telegram, Discord, Slack | Cada canal pide el token y **quién puede hablar con el bot**. Sin lista de permitidos el canal no se activa. |

## Qué recibes

- La **dirección** de la app (el panel).
- El **token del gateway**, mostrado **una vez**: es la credencial de acceso al panel.
- El siguiente paso (pegar el token y esperar el emparejamiento del primer navegador) y la instrucción de WhatsApp.

## Primeros pasos

1. Después del deploy, abre la dirección y pega el **token del gateway** en *Configuración > Gateway*. Espera hasta 15 s: el primer navegador se empareja solo.
2. Conversa con el asistente en el panel. Pide algo que use la web ("abre el sitio X y resume"): en *Chat > + > Browser* ves lo que él ve.
3. Para conectar **WhatsApp**: *Configuración > Canales > WhatsApp* y escanea el QR en cuanto aparezca (expira). Una sesión de WhatsApp por app.
4. Para cambiar de proveedor o modelo después: *Configuración > Modelos* en el panel.

## Límites conocidos

- El primer arranque tarda 30-45 s sin canales y **1 a 3 min con Discord o Slack** (OpenClaw instala los plugins del canal desde npm y ejecuta el doctor; necesita salida al registro npm). Después, 15-50 s.
- RAM: **3 GB como mínimo con el navegador** (4 GB recomendado); sin navegador, 2 GB (3 GB recomendado). El gateway usa cerca de 1 GiB; el navegador con varias pestañas pesadas llega a ~1,9 GiB.
- `/app/.openclaw/openclaw.json` se genera **una vez**; después es tuyo y el panel lo reescribe. El token del gateway, el origen público y el modelo siguen las variables de la app (por referencia).
- El emparejamiento automático del primer navegador reduce "token + aprobación" a "token" **en ese primer dispositivo**. `OPENCLAW_BOOTSTRAP_PAIRING=off` lo desactiva.
- El navegador del agente bloquea la red privada/local (política SSRF de OpenClaw) y corre sin el sandbox propio de Chromium (el contenedor es el aislamiento).
- **Prueba local (dev):** el gateway solo acepta un origen público HTTPS o `http://localhost` / `http://127.0.0.1`. En producción `{{app.url}}` siempre es HTTPS, así que nada cambia. En un entorno local la dirección de la app es `http://<nombre>.localhost:8080` y el gateway se niega a arrancar (el deploy termina `unhealthy`); para probar en local, publica la app con una copia de la plantilla cuyo `PUBLIC_ORIGIN` sea `http://localhost:8080`. El manifiesto no cambia por esto.
- El deploy sin downtime queda desactivado (dos copias en el mismo disco no conviven); volver de versión lleva los datos.
- Los modelos predeterminados de cada proveedor vienen de la documentación de OpenClaw; indica el modelo si quieres otro. No se ejercitó con una clave real de proveedor.

## Licencia

OpenClaw se distribuye bajo la licencia MIT (OpenClaw Foundation): <https://github.com/openclaw/openclaw/blob/main/LICENSE>. El Chromium del runtime sigue la licencia del proyecto Chromium. Este template es un empaquetado de Vertra Cloud y no está afiliado al proyecto; el ícono es el logo oficial, sin cambios (`ICONS.md`).

Más detalles: [docs/first-steps.es.md](docs/first-steps.es.md) · [docs/reference.es.md](docs/reference.es.md)
