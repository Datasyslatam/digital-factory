# Bootcamp Digital Factory 2026 — SENA Regional Atlántico

Página web oficial de inscripción al **Bootcamp Digital Factory 2026**, evento del
SENA Regional Atlántico y el Nodo TIC Barranquilla sobre Inteligencia Artificial,
Automatización, Productividad e Industria 4.0.

---

## Descripción

El sitio permite a aspirantes al Bootcamp registrarse en línea eligiendo su rol
de participación (**Aprendiz SENA** o **Invitado / Empresa**). Cada registro se
almacena en una Google Sheet, se genera un **código QR de acceso** individual y
se envía un **correo de confirmación** automático al participante.

La página usa un estilo **cyberpunk / neón institucional**, con banner de
imágenes en rotación automática, contador regresivo, estadísticas animadas y
menú responsivo.

---

## Características

- Banner hero con **carrusel de imágenes automático** (efecto Ken Burns).
- Formulario dinámico con selección de rol mediante tarjetas interactivas.
- Validación de campos en el cliente (nombre, documento, correo, etc.).
- Envío de datos a **Google Sheets** a través de **Google Apps Script**.
- Generación de **código QR** con el tipo y número de documento del participante.
- Correo de confirmación HTML con el QR incrustado.
- Detección de **registros duplicados** por número de documento.
- Contador regresivo al evento, estadísticas animadas, partículas y efectos neon.
- Diseño 100 % responsivo y sin dependencias de frameworks (HTML/CSS/JS puro).

---

## Tecnologías

| Capa                | Tecnología                          |
| ------------------- | ----------------------------------- |
| Frontend            | HTML5, CSS3, JavaScript (vanilla)   |
| Tipografías         | Google Fonts (Space Grotesk, Plus Jakarta Sans) |
| Íconos              | Font Awesome 6 CDN                  |
| Backend             | Google Apps Script                  |
| Base de datos       | Google Sheets (hojas Aprendices / Invitados) |
| Código QR           | API externa api.qrserver.com        |
| Correos             | GmailApp (cuenta dueña del script)  |