# Webhook RSVP → Google Sheets

Recibe las confirmaciones del formulario RSVP (Netlify Forms) y las escribe en
una Google Sheet. **Pinta toda la fila de verde claro (`#d9ead3`) cuando el
invitado confirma que SÍ asiste.**

## Despliegue (una sola vez)

1. Abre la Google Sheet donde quieres las confirmaciones.
2. Menú **Extensiones → Apps Script**.
3. Borra el contenido de `Code.gs` y pega el de [`Code.gs`](./Code.gs). Guarda.
4. **Implementar → Nueva implementación → Tipo: Aplicación web**.
   - *Ejecutar como:* Yo.
   - *Quién tiene acceso:* **Cualquier persona**.
5. Copia la **URL de la app web** (`https://script.google.com/macros/s/…/exec`).

## Conectar Netlify al webhook

1. En Netlify: **Site configuration → Forms → Form notifications**.
2. **Add notification → Outgoing webhook**.
   - *Event to listen for:* `New form submission`.
   - *URL to notify:* la URL de la app web del paso anterior.
   - *Form:* `rsvp`.
3. Guarda. Las próximas confirmaciones llegarán al script.

## Probar

- `GET` a la URL → debe responder `{"ok":true,"msg":"Webhook RSVP activo"}`.
- Envía el formulario en el sitio; debe aparecer una fila nueva.
  Si la asistencia es **Sí**, la fila se pinta de verde claro.

## Notas

- La hoja usada se llama `RSVP` (se crea sola con encabezados si no existe).
- Si cambias el código, crea una **nueva implementación** (o "Administrar
  implementaciones → editar → Nueva versión") para que surta efecto.
- Reconoce como "sí": `Sí`, `Si`, `yes`, `y` (sin distinción de mayúsculas).
