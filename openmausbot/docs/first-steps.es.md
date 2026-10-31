# Primeros pasos

1. **Toma el código.** Abre el log de la app y copia el código de la línea `pairing code` (un solo uso, vale 5 minutos). La línea `open or scan` trae el enlace completo.
2. **Empareja el navegador.** Abre `<dirección de la app>/pair`, escribe el código y confirma. Un código incorrecto o vencido se rechaza; un código solo vale una vez.
3. **Entra en Claude y en Codex.** *Configuración > IA > Engines*:
   - *Claude*: el botón de login abre la página de Anthropic; copia el código que muestre y pégalo de vuelta en la app.
   - *Codex*: la app muestra un código de un solo uso para escribir en la página de OpenAI (el login por código de dispositivo debe estar activo en la seguridad de la cuenta de ChatGPT).
   - Con clave de API en lugar de cuenta personal: *Configuración > Conexiones > Model providers*.
4. **Crea bots y conversa.** Cada bot usa Claude o Codex con tu login. Las rutinas programadas siguen funcionando con el navegador cerrado.

## Otro dispositivo
Reinicia la app (cada inicio imprime un código nuevo) o usa *Phone apps* en la configuración. Solo un navegador emparejado con acceso total ve la configuración.

## Actualizar y volver
Los paquetes están fijados en el template; una versión nueva del template los cambia. La plataforma toma un snapshot antes de actualizar, y volver de versión se lleva los datos.
