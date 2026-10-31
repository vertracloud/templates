# n8n

[Português (Brasil)](README.md) · [English](README.en.md) · [Español](README.es.md)

Automatización de workflows con editor visual. n8n 2.44.7 como **proyecto de código** en el runtime Node.js 24 de Vertra Cloud: el deploy instala el paquete `n8n` de npm (versión fijada en `package-lock.json`) y `start.sh` inicia el editor o el worker. El código queda abierto para lectura en `src/`.

## Qué es

- **Editor y webhooks** en la dirección de la app; la base de datos se elige en el asistente.
- **Nodo Code en JavaScript**, ejecutado por el task runner interno de n8n (un proceso junto al editor, sin contenedor extra).
- **Nodos de la comunidad** (*Configuración > Nodos de la comunidad*): quedan en `/app/.n8n/nodes` y sobreviven al reinicio y a la actualización; en modo cola el worker reinstala los paquetes al iniciar.
- **Correo (SMTP)** opcional para invitaciones y restablecer contraseña.
- **Retención**: el historial de ejecuciones se borra tras 7 días o 5000 ejecuciones.
- Telemetría, aviso de versión y personalización desactivados; los nodos "Execute Command" y "Local File Trigger" vienen desactivados por n8n.

## Qué cambió respecto de la versión de imagen

- **El nodo Code en Python ya no existe.** El runtime Node no trae el runner de Python de n8n; usa JavaScript en el nodo Code. Un nodo Code en Python indica que el runner no está disponible.
- El deploy **instala las dependencias** (`npm ci`, cerca de 2,5 minutos) y usa cerca de 2,7 GB de disco por app (el worker tiene su propia copia).
- Los módulos permitidos en el nodo Code (opción *Seguro* o *Todos*) valen solo para JavaScript.

## Qué pregunta el asistente

| Pregunta | Para qué sirve |
|---|---|
| Correo del administrador (owner) | El correo de la cuenta de owner, creada en el deploy con una contraseña generada (se muestra una vez en las salidas). |
| ¿Cómo va a correr n8n? | **Postgres administrado** (por defecto: n8n + Postgres, 2 GB en total), **SQLite interno** (solo n8n, 1 GB) o **Escalar con workers** (n8n + 1 worker + Postgres + Redis, 3,5 GB). |
| Ejecuciones en paralelo en el worker | Solo en el modo con workers. Por defecto 5; más paralelismo pide más RAM del worker. |
| Zona horaria de las programaciones | America/Sao_Paulo, UTC, America/New_York o Europe/Lisbon. |
| Módulos permitidos en el nodo Code | **Seguro** (por defecto): solo módulos de datos y texto. **Todos**: también archivos, procesos y red dentro de tu contenedor. |
| ¿Enviar correos de n8n? | Opcional (invitaciones y restablecer contraseña): servidor SMTP, seguridad, puerto, usuario, contraseña y remitente. |

## Qué recibes

- La **dirección** de la app (editor y webhooks).
- **Correo y contraseña del owner**: la cuenta de administrador ya existe al final del deploy; la contraseña se genera y se muestra **una sola vez**. Nadie puede crearla antes que tú.

## Primeros pasos

1. Elige cómo va a correr n8n, la zona horaria y, si quieres, el SMTP.
2. Después del deploy abre la dirección e inicia sesión con el correo y la contraseña de **owner** de las salidas.
3. En un nodo **Code** usa el lenguaje **JavaScript**.
4. Guarda una copia de `N8N_ENCRYPTION_KEY` (variable de la app): sin ella no se pueden leer las credenciales de un respaldo.

## Límites conocidos

- **Clave de cifrado:** las credenciales de los flujos se cifran con `N8N_ENCRYPTION_KEY` (secreto generado una vez, igual en el editor y en el worker).
- Primer arranque 10 a 60 s (migra la base). RAM del editor 500 a 900 MiB; del worker 440 a 500 MiB. El task runner del Code arranca junto con n8n.
- El modo con workers crea **1 worker** (más workers dependen de las réplicas de la plataforma); el worker no tiene dirección pública y solo habla con Postgres y Redis. No hay webhook processors dedicados: los webhooks los atiende el editor.
- El deploy sin downtime queda desactivado: en modo cola dos copias se declaran líderes y los disparadores de polling correrían duplicados. El rollback vuelve **con los datos** (n8n migra la base).
- Un nodo de la comunidad corre **dentro** del proceso de n8n, con acceso a lo que n8n alcanza: instala solo paquetes en los que confíes.
- Cuerpo máximo de petición 16 MiB (valor por defecto de n8n).
- n8n marca el modo de task runner interno como obsoleto y puede exigir el modo externo en versiones futuras; actualizar n8n pide un template nuevo, probado.
- El correo con STARTTLS/SSL real aún necesita confirmación en producción.

## Licencia

n8n se distribuye bajo la **Sustainable Use License** (uso interno de negocio o personal/no comercial; n8n GmbH): <https://github.com/n8n-io/n8n/blob/master/LICENSE.md>. Lee la licencia antes de ofrecer n8n a terceros. El ícono es el símbolo oficial de n8n, sin cambios (`ICONS.md`). Este template es un empaquetado de Vertra Cloud y no está afiliado a n8n.

Más detalles: [docs/first-steps.es.md](docs/first-steps.es.md) · [docs/reference.es.md](docs/reference.es.md)
