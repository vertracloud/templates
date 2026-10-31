# Primeros pasos

1. **Entra como owner.** La cuenta de owner ya existe cuando termina el deploy: abre la dirección e inicia sesión con el correo que indicaste y la contraseña de las salidas (se muestra una vez). n8n reaplica estos datos en cada arranque y bloquea el cambio de correo y contraseña en la interfaz; para cambiarlos, edita `N8N_INSTANCE_OWNER_EMAIL` o la contraseña `VERTRA_OWNER_PASSWORD` en las variables de la app y reinicia.
2. **Tu primer flujo.** *Create workflow*, agrega un **Webhook** y un nodo **Code** en JavaScript:
   ```javascript
   return [{ json: { ok: true, n: $input.all().length } }];
   ```
   El nodo Code en Python no está disponible en este template.
3. **Módulos de Code.** En modo **Seguro** solo entran los módulos de datos y texto: crypto, url, path, util, zlib, buffer, querystring, string_decoder, events, stream, assert (+ moment). Para liberar todo (fs, child_process, http...), elige **Todos** o cambia `VERTRA_CODE_MODULES` (`safe` / `all`) en las variables de la app.
4. **Nodos de la comunidad.** *Configuración > Nodos de la comunidad > Instalar*, indica el paquete de npm. Necesita salida al registro npm.
5. **Workers.** En el modo con workers, el editor entrega cada ejecución al worker por Redis. Ajusta el paralelismo en `N8N_WORKER_CONCURRENCY` (el asistente pregunta).
6. **Correo.** Con SMTP configurado, *Settings > Users > Invite* envía la invitación por correo. El nodo *Send Email* usa la credencial del propio flujo.

## Actualizar y volver
La plataforma toma un snapshot antes de actualizar y el rollback vuelve **con los datos**. Las actualizaciones de versión de n8n llegan como versiones nuevas del template y reinstalan las dependencias.
