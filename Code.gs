/**
 * ============================================================================
 * BOOTCAMP DIGITAL FACTORY 2026 — Backend (Google Apps Script)
 * ----------------------------------------------------------------------------
 * Recibe cada inscripción enviada desde el formulario (index.html), la guarda
 * en Google Sheets, genera un código QR único para ESA persona y le envía un
 * correo de confirmación con el QR incrustado (y adjunto como imagen).
 *
 * Configuración necesaria antes de desplegar (ver INSTRUCCIONES.md):
 *   1. Reemplazar SHEET_ID con el ID de tu Google Sheet.
 *   2. Desplegar como aplicación web (Implementar > Nueva implementación).
 *   3. Copiar la URL /exec resultante en scripts/script.js (GAS_WEB_APP_URL).
 * ============================================================================
 */

const SHEET_ID = 'https://docs.google.com/spreadsheets/d/1TUfzV8lSomRgISSeBR_pQ0eTs3TnnRI4lcgP1o-r6qU/edit?usp=sharing';
const SHEET_APRENDICES = 'Aprendices';
const SHEET_INVITADOS = 'Invitados';

const NOMBRE_EVENTO = 'Bootcamp Digital Factory 2026';
const NOMBRE_REMITENTE = 'SENA Regional Atlántico · Nodo TIC';
const LUGAR_EVENTO = 'Nodo TIC Barranquilla — Cra. 54 # 68-80, Barranquilla';
const FECHA_EVENTO = '22 y 23 de septiembre de 2026 · 8:00 a.m. – 6:00 p.m.';

/**
 * Punto de entrada: recibe el POST del formulario.
 */
function doPost(e) {
  const respuesta = { result: 'error', message: 'Solicitud inválida.' };

  try {
    const data = JSON.parse(e.postData.contents);
    const rol = data.role === 'Invitado' ? 'Invitado' : 'Aprendiz';

    const nombreCompleto = (data.nombreCompleto || '').trim();
    const tipoDocumento = (data.tipoDocumento || '').trim();
    const numeroDocumento = (data.numeroDocumento || '').trim();
    const correo = (data.correo || '').trim();

    if (!nombreCompleto || !tipoDocumento || !numeroDocumento || !correo) {
      respuesta.message = 'Faltan campos obligatorios.';
      return jsonOutput(respuesta);
    }

    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheetName = rol === 'Aprendiz' ? SHEET_APRENDICES : SHEET_INVITADOS;
    const sheet = obtenerOCrearHoja(ss, sheetName);

    // Evita registrar dos veces a la misma persona (por número de documento)
    if (yaExisteRegistro(sheet, numeroDocumento)) {
      respuesta.result = 'duplicate';
      respuesta.message = 'Ya existe una inscripción registrada con ese número de documento.';
      return jsonOutput(respuesta);
    }

    // Código de acceso único para ESTA persona (va dentro de su QR individual)
    const codigoAcceso = generarCodigoAcceso(rol, numeroDocumento);
    const fecha = new Date();

    if (rol === 'Aprendiz') {
      asegurarEncabezados(sheet, [
        'Fecha', 'Número de Ficha', 'Nombre Completo', 'Tipo de Documento',
        'Número de Documento', 'Correo', 'Centro', 'Código de Acceso'
      ]);
      sheet.appendRow([
        fecha, data.numFicha || '', nombreCompleto, tipoDocumento,
        numeroDocumento, correo, data.centro || '', codigoAcceso
      ]);
    } else {
      asegurarEncabezados(sheet, [
        'Fecha', 'Nombre Completo', 'Tipo de Documento',
        'Número de Documento', 'Correo', 'Empresa', 'Código de Acceso'
      ]);
      sheet.appendRow([
        fecha, nombreCompleto, tipoDocumento,
        numeroDocumento, correo, data.empresa || '', codigoAcceso
      ]);
    }

    // Genera el QR individual y envía el correo con ese QR incrustado
    const qrBlob = generarImagenQR(codigoAcceso, nombreCompleto);
    enviarCorreoConfirmacion(correo, nombreCompleto, rol, codigoAcceso, qrBlob);

    respuesta.result = 'success';
    respuesta.message = 'Registro guardado y correo con QR enviado correctamente.';
    return jsonOutput(respuesta);

  } catch (err) {
    respuesta.message = 'Error interno: ' + err.message;
    return jsonOutput(respuesta);
  }
}

/** Devuelve la respuesta como JSON (requerido por fetch() del frontend). */
function jsonOutput(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Crea la hoja si no existe todavía. */
function obtenerOCrearHoja(spreadsheet, nombre) {
  let sheet = spreadsheet.getSheetByName(nombre);
  if (!sheet) sheet = spreadsheet.insertSheet(nombre);
  return sheet;
}

/** Escribe los encabezados solo si la hoja está vacía. */
function asegurarEncabezados(sheet, encabezados) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(encabezados);
    sheet.getRange(1, 1, 1, encabezados.length).setFontWeight('bold');
  }
}

/** Revisa si el número de documento ya fue registrado en esa hoja. */
function yaExisteRegistro(sheet, numeroDocumento) {
  const datos = sheet.getDataRange().getValues();
  for (let i = 1; i < datos.length; i++) {
    if (datos[i].map(String).indexOf(numeroDocumento) !== -1) return true;
  }
  return false;
}

/** Genera un código de acceso único por persona, para incrustar en su QR. */
function generarCodigoAcceso(rol, numeroDocumento) {
  const prefijo = rol === 'Aprendiz' ? 'BDF26-APR-' : 'BDF26-INV-';
  const sufijo = new Date().getTime().toString(36).toUpperCase();
  return prefijo + numeroDocumento + '-' + sufijo;
}

/** Genera la imagen PNG del QR (API pública api.qrserver.com) a partir del código. */
function generarImagenQR(contenido, nombreArchivo) {
  const url = 'https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=10&data='
    + encodeURIComponent(contenido);
  const blob = UrlFetchApp.fetch(url).getBlob();
  blob.setName((nombreArchivo || 'qr').replace(/\s+/g, '_') + '_QR.png');
  return blob;
}

/** Envía el correo de confirmación con el QR incrustado en el cuerpo y adjunto. */
function enviarCorreoConfirmacion(correoDestino, nombreCompleto, rol, codigoAcceso, qrBlob) {
  const asunto = 'Confirmación de inscripción · ' + NOMBRE_EVENTO;

  const cuerpoHtml =
    '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;' +
    'background:#0b0f14;color:#f5f5f5;border-radius:12px;overflow:hidden;">' +
      '<div style="background:#111820;padding:24px;text-align:center;">' +
        '<h1 style="color:#f4d03f;font-size:20px;margin:0;">' + NOMBRE_EVENTO + '</h1>' +
        '<p style="color:#aaa;font-size:13px;margin:4px 0 0;">SENA Regional Atlántico · Nodo TIC Barranquilla</p>' +
      '</div>' +
      '<div style="padding:24px;">' +
        '<p>Hola <strong>' + nombreCompleto + '</strong>,</p>' +
        '<p>Tu inscripción como <strong>' + rol + '</strong> ha sido registrada correctamente. ' +
        'Presenta el siguiente código QR el día del evento para validar tu acceso:</p>' +
        '<div style="text-align:center;margin:24px 0;">' +
          '<img src="cid:qrImage" alt="Código QR de acceso" ' +
          'style="width:220px;height:220px;border:6px solid #fff;border-radius:8px;" />' +
          '<p style="font-size:12px;color:#aaa;margin-top:8px;">Código: ' + codigoAcceso + '</p>' +
        '</div>' +
        '<p style="font-size:13px;color:#ccc;">📍 ' + LUGAR_EVENTO + '<br>🗓️ ' + FECHA_EVENTO + '</p>' +
        '<p style="font-size:12px;color:#888;margin-top:24px;">Si no realizaste este registro, puedes ignorar este mensaje.</p>' +
      '</div>' +
    '</div>';

  GmailApp.sendEmail(
    correoDestino,
    asunto,
    'Tu inscripción fue registrada. Presenta el código QR adjunto el día del evento. Código: ' + codigoAcceso,
    {
      htmlBody: cuerpoHtml,
      name: NOMBRE_REMITENTE,
      inlineImages: { qrImage: qrBlob },
      attachments: [qrBlob]
    }
  );
}
