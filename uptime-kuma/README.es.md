# Uptime Kuma

[Português (Brasil)](README.md) · [English](README.en.md) · [Español](README.es.md)

Monitoreo de sitios y servicios con alertas y página de estado pública. Uptime Kuma 2.5.8 (variante `slim`, SQLite), en una imagen de Vertra que mantiene el programa fuera de `/app` y los datos en el disco de la app.

## Qué es

- Monitores de HTTP(S), TCP, ping, DNS, palabra clave, JSON, push (heartbeat) y otros, con intervalos desde 20 s.
- Alertas por Telegram, Discord, Slack, correo (SMTP), webhook y decenas de otros canales.
- Páginas de estado públicas (`/status/<nombre>`), que también puedes publicar en tu dominio.
- Base SQLite en `/app/data`, en el disco de la app: entra en los backups y snapshots.

## Qué pregunta el asistente

Sin preguntas: la app arranca lista.

## Qué recibes

- La **dirección** de la app.
- **Usuario y contraseña del administrador** (`admin` y una contraseña generada, que se muestra **una vez**): la cuenta ya existe cuando termina el deploy, así que nadie puede crearla antes que tú.

## Primeros pasos

1. Abre la dirección e inicia sesión con `admin` y la contraseña de las salidas (puedes cambiarla en Configuración > Perfil).
2. En **Add New Monitor**, elige el tipo, indica el destino y el intervalo.
3. En **Settings > Notifications**, conecta Telegram, Discord, correo u otro canal y marca "Default enabled" para los monitores nuevos.
4. En **Status Pages**, crea una página pública y elige qué monitores muestra.

## Límites conocidos

- El monitor **Real Browser** (Chromium) no existe: la imagen `slim` no trae navegador.
- Sin MariaDB embebido: solo SQLite. Para miles de monitores, prefiere otra instalación.
- Sin monitor de contenedor Docker (no hay acceso al Docker del servidor).
- Las pruebas salen de un único lugar (el servidor de tu app). Una alerta de caída refleja la ruta de ese servidor hasta el destino.
- El deploy sin downtime queda desactivado: dos copias sobre la misma base ejecutarían todos los monitores por duplicado (alertas repetidas).
- La app usa poca RAM (cerca de 120 MiB en reposo); 512 MB es el piso de una app web.

## Licencia

Uptime Kuma se distribuye bajo la licencia MIT (Louis Lam y colaboradores): <https://github.com/louislam/uptime-kuma/blob/master/LICENSE>. El ícono es el logo oficial del proyecto, sin cambios (ver `ICONS.md` en la raíz del repositorio); el listado no implica respaldo del proyecto.

Más detalles: [docs/first-steps.es.md](docs/first-steps.es.md) · [docs/reference.es.md](docs/reference.es.md)
