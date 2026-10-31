# Primeros pasos

1. **Guarda la API key global.** Aparece **una sola vez** en las salidas del asistente. Si la pierdes, cambia el secreto `AUTHENTICATION_API_KEY` en las variables de la app y reinicia.
2. **Abre el panel** en `<dirección>/manager` y entra con la API key.
3. **Crea una instancia.** Nombre libre, integración `WHATSAPP-BAILEYS`. El panel muestra el código QR; en el celular, *WhatsApp > Dispositivos vinculados > Vincular un dispositivo*.
4. **Envía un mensaje de prueba:**
   ```bash
   curl -X POST "<dirección>/message/sendText/<instancia>" \
     -H "apikey: <clave>" -H "Content-Type: application/json" \
     -d '{"number":"5511999999999","text":"Hola desde Evolution API"}'
   ```
5. **Recibe eventos.** En *Webhook* de la instancia indica la URL de tu servicio y marca los eventos (`MESSAGES_UPSERT`, `CONNECTION_UPDATE`...).

## Caché local o Redis
Lo predeterminado es la caché local (sin Redis). Elige Redis administrado en el asistente si quieres que la caché sobreviva a los reinicios del proceso; usa 512 MB más del plan y conecta con certificado de cliente.

## Backup y actualización
Los datos viven en el Postgres de la stack y en los archivos de `/app` (`instances`, `store`). La plataforma toma un snapshot antes de actualizar y el rollback vuelve con los datos.
