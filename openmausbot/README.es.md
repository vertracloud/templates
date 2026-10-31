# OpenMausBot

[Português (Brasil)](README.md) · [English](README.en.md) · [Español](README.es.md)

App de chat donde cada contacto es un agente **Claude Code** o **Codex**, con personalidad, memoria, rutinas programadas e interfaz web. OpenMausBot 0.1.134 como proyecto de código en el runtime Node 24 de Vertra; `openmausbot`, Claude Code (2.1.316) y Codex (0.166.0) son paquetes de npm fijados en `package-lock.json`. Entras con tu propia cuenta de Claude y/o ChatGPT: Vertra no aloja ningún modelo.

## Qué pregunta el asistente

Nada. Las cuentas de Claude y Codex se conectan dentro de la app, y el acceso es mediante un código de emparejamiento impreso en el log.

## Qué recibes

- La **dirección** de la app (la interfaz web).
- Cómo entrar (emparejamiento) y cómo conectar Claude y Codex, en las salidas de la app.

## Primeros pasos

1. Tras el deploy, abre el **log de la app** y copia el código de la línea `pairing code` (12 caracteres, un solo uso, vale 5 minutos). La línea `open or scan` trae el enlace con el código ya incluido.
2. Abre `<dirección de la app>/pair`, escribe el código y confirma. La sesión del navegador dura 30 días y se renueva con cada uso.
3. En *Configuración > IA > Engines*, entra en **Claude** (pega de vuelta el código que muestre Anthropic) y/o en **Codex** (login de ChatGPT con código de dispositivo). Los inicios de sesión quedan en `/app/.claude` y `/app/.codex`.
4. Crea los bots y conversa. Otro dispositivo: reinicia la app para generar un código nuevo, o usa *Phone apps* en la configuración de la app.

## Límites conocidos

- **Una sesión emparejada equivale a acceso de administrador a la app**: los bots ejecutan comandos dentro del contenedor. No emparejes dispositivos que no conoces.
- Quien tenga los archivos de la app (snapshots incluidos) tiene los inicios de sesión de Claude y Codex.
- El primer deploy tarda unos 2 minutos en instalar los paquetes (1,2 GB en disco); los siguientes arranques, unos segundos.
- RAM: 2 GB como mínimo (3 GB recomendado). En reposo, la app usa unos 0,2 GB; cada bot activo ejecuta su propio proceso de Claude o de Codex.
- Solo se expone el puerto 80: el receptor de webhooks de OpenMausBot (un puerto aparte) no es accesible. El navegador de los bots no viene instalado.
- El deploy sin downtime está desactivado (el servidor no admite dos copias en la misma carpeta de datos). Los paquetes solo cambian con una nueva versión del template.
- La interfaz web envía estadísticas anónimas de uso (PostHog) hasta que las desactives en *Configuración > General > Usage analytics*.
- No se probó con un login real de Claude o Codex.

## Licencia

OpenMausBot se distribuye bajo Apache-2.0: <https://github.com/milind-soni/OpenMausBot/blob/main/LICENSE>. El paquete npm incluye además una carpeta `enterprise/` con licencia propia y código disponible; el template la mantiene desactivada (edición open source). Codex (`@openai/codex`) es Apache-2.0; Claude Code (`@anthropic-ai/claude-code`) sigue los términos de Anthropic. Los nombres OpenMausBot y MausBot y la mascota son marcas de Supamaus Software Private Limited; este template es un empaquetado de Vertra Cloud, sin afiliación con el proyecto, y el ícono es el oficial del proyecto, usado solo para identificar lo que el template empaqueta (`ICONS.md`).

Más detalles: [docs/first-steps.es.md](docs/first-steps.es.md) · [docs/reference.es.md](docs/reference.es.md)
