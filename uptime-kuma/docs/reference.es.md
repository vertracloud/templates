# Referencia

## Variables de la app

| Variable | Valor | Para qué sirve |
|---|---|---|
| `UPTIME_KUMA_DB_TYPE` | `sqlite` | Sin esto Kuma 2.x abre el asistente "Setup Database" y no arranca solo. |
| `DATA_DIR` | `/app/data/` | Carpeta de datos, en el disco persistente de la app. |
| `PORT` | `3001` | Definida por la plataforma (puerto de la app). |

## Recursos

- RAM: mínimo 512 MB (piso de una app web); en uso, cerca de 110-120 MiB.
- Puerto 3001; healthcheck en `/api/entry-page` (arranca en segundos).
- Disco: la base crece con el historial de latidos; Kuma borra el historial antiguo (por defecto: 180 días, en *Settings > Monitor History*).

## Problemas comunes

- **Olvidé la contraseña del administrador.** La contraseña de las salidas solo vale en el primer arranque. Para empezar de nuevo, borra los datos (`/app/data`) en el gestor de archivos y reinicia (el administrador `admin` se recrea con la contraseña de la variable `KUMA_ADMIN_PASSWORD`), o haz rollback a un snapshot anterior.
- **El monitor Ping no responde.** `ping` corre sin privilegios (sockets ICMP de datagrama). Algunos destinos filtran ICMP; usa un monitor TCP o HTTP.
- **Alertas duplicadas.** Mantén una sola copia de la app (el deploy sin downtime viene desactivado por eso).
