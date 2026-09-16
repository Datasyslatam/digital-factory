/**
 * =============================================================================
 * BOOTCAMP DIGITAL FACTORY 2026 - Backend de inscripciones
 * -----------------------------------------------------------------------------
 * Este script se pega en el Apps Script de una Google Sheet (Extensiones >
 * Apps Script) y se despliega como "Aplicación web". Recibe el formulario del
 * sitio (index.html), guarda cada registro en la hoja correspondiente
 * (Aprendices o Invitados), genera un código QR con el tipo y número de
 * documento de la persona (para evitar exponer IDs internos/consecutivos) y
 * envía un correo de confirmación con el QR referenciado por URL remota
 * (<img src="https://...">) para que aparezca dentro del cuerpo del mensaje,
 * nunca como archivo adjunto.
 *
 * =============================================================================
 */

/* ----------------------------- CONFIGURACIÓN ----------------------------- */

const CONFIG = {
  SHEET_APRENDICES: 'Aprendices',
  SHEET_INVITADOS: 'Invitados',
  EVENTO_NOMBRE: 'BOOTCAMP DIGITAL FACTORY 2026',
  EVENTO_FECHAS: '22 y 23 de septiembre de 2026',
  EVENTO_HORARIO: '8:00 a.m. - 6:00 p.m.',
  EVENTO_LUGAR: 'Nodo TIC Barranquilla · Cra. 54 # 68-80, Barranquilla, Atlántico',
  CORREO_REMITENTE_NOMBRE: 'SENA Regional Atlántico · Digital Factory',
  // Evita registros duplicados por número de documento en la misma hoja.
  EVITAR_DUPLICADOS: true
};

/* ------------------------------- ENDPOINTS -------------------------------- */

function doPost(e) {
  let payload;
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse({ result: 'error', message: 'Cuerpo de la petición inválido.' });
  }

  try {
    const role = (payload.role || '').trim();

    if (role === 'Aprendiz') {
      return registrarAprendiz(payload);
    } else if (role === 'Invitado') {
      return registrarInvitado(payload);
    }
    return jsonResponse({ result: 'error', message: 'Rol de participante no reconocido.' });
  } catch (err) {
    console.error(err);
    return jsonResponse({ result: 'error', message: 'Ocurrió un error interno al procesar el registro.' });
  }
}

function doGet(e) {
  return jsonResponse({ result: 'success', message: 'Backend de Bootcamp Digital Factory activo.' });
}

/* ----------------------------- REGISTRO ----------------------------------- */

function registrarAprendiz(payload) {
  const nombreCompleto = limpiar(payload.nombreCompleto);
  const tipoDocumento = limpiar(payload.tipoDocumento);
  const numeroDocumento = limpiar(payload.numeroDocumento);
  const correo = limpiar(payload.correo);
  const numFicha = limpiar(payload.numFicha);
  const centro = limpiar(payload.centro);

  const faltantes = [];
  if (!numFicha) faltantes.push('Número de Ficha');
  if (!nombreCompleto) faltantes.push('Nombre Completo');
  if (!tipoDocumento) faltantes.push('Tipo de Documento');
  if (!numeroDocumento) faltantes.push('Número de Documento');
  if (!correo) faltantes.push('Correo Electrónico');
  if (!centro) faltantes.push('Centro SENA');

  if (faltantes.length) {
    return jsonResponse({ result: 'error', message: 'Faltan datos: ' + faltantes.join(', ') });
  }
  if (!esCorreoValido(correo)) {
    return jsonResponse({ result: 'error', message: 'El correo electrónico no es válido.' });
  }

  const sheet = getSheet_(CONFIG.SHEET_APRENDICES, [
    'Fecha de Registro', 'Número de Ficha', 'Nombre Completo', 'Tipo de Documento',
    'Número de Documento', 'Centro SENA', 'Correo Electrónico', 'Código QR (contenido)',
    'Estado del correo'
  ]);

  const colNumeroDocumento = columnaEncabezado_(sheet, 'Número de Documento');
  if (CONFIG.EVITAR_DUPLICADOS && colNumeroDocumento > 0 && yaRegistrado_(sheet, numeroDocumento, colNumeroDocumento)) {
    return jsonResponse({ result: 'error', message: 'Este número de documento ya fue registrado como Aprendiz.' });
  }

  const qrContenido = tipoDocumento + '-' + numeroDocumento;
  sheet.appendRow([
    new Date(), numFicha, nombreCompleto, tipoDocumento, numeroDocumento, centro, correo, qrContenido
  ]);

  const resCorreo = enviarCorreoConfirmacion_({
    correo: correo,
    nombreCompleto: nombreCompleto,
    rolEtiqueta: 'Aprendiz SENA · Ficha ' + numFicha,
    qrContenido: qrContenido
  });
  registrarEstadoCorreo_(sheet, resCorreo);

  return jsonResponse({ result: 'success', emailEnviado: resCorreo.enviado, emailError: resCorreo.error, qrOk: resCorreo.qrOk, qrError: resCorreo.qrError });
}

function registrarInvitado(payload) {
  const nombreCompleto = limpiar(payload.nombreCompleto);
  const tipoDocumento = limpiar(payload.tipoDocumento);
  const numeroDocumento = limpiar(payload.numeroDocumento);
  const correo = limpiar(payload.correo);
  const empresa = limpiar(payload.empresa);

  const faltantes = [];
  if (!nombreCompleto) faltantes.push('Nombre Completo');
  if (!tipoDocumento) faltantes.push('Tipo de Documento');
  if (!numeroDocumento) faltantes.push('Número de Documento');
  if (!correo) faltantes.push('Correo Electrónico');
  // La empresa es opcional ("si aplica"), no se exige.

  if (faltantes.length) {
    return jsonResponse({ result: 'error', message: 'Faltan datos: ' + faltantes.join(', ') });
  }
  if (!esCorreoValido(correo)) {
    return jsonResponse({ result: 'error', message: 'El correo electrónico no es válido.' });
  }

  const sheet = getSheet_(CONFIG.SHEET_INVITADOS, [
    'Fecha de Registro', 'Empresa o Entidad', 'Nombre Completo', 'Tipo de Documento',
    'Número de Documento', 'Correo Electrónico', 'Código QR (contenido)',
    'Estado del correo'
  ]);

  const colNumeroDocumento = columnaEncabezado_(sheet, 'Número de Documento');
  if (CONFIG.EVITAR_DUPLICADOS && colNumeroDocumento > 0 && yaRegistrado_(sheet, numeroDocumento, colNumeroDocumento)) {
    return jsonResponse({ result: 'error', message: 'Este número de documento ya fue registrado como Invitado.' });
  }

  const qrContenido = tipoDocumento + '-' + numeroDocumento;
  sheet.appendRow([
    new Date(), empresa || '(No aplica)', nombreCompleto, tipoDocumento, numeroDocumento, correo, qrContenido
  ]);

  const resCorreo = enviarCorreoConfirmacion_({
    correo: correo,
    nombreCompleto: nombreCompleto,
    rolEtiqueta: empresa ? 'Invitado · ' + empresa : 'Invitado',
    qrContenido: qrContenido
  });
  registrarEstadoCorreo_(sheet, resCorreo);

  return jsonResponse({ result: 'success', emailEnviado: resCorreo.enviado, emailError: resCorreo.error, qrOk: resCorreo.qrOk, qrError: resCorreo.qrError });
}

/* ------------------------------- CORREO + QR ------------------------------- */

function enviarCorreoConfirmacion_(datos) {
  // El QR codifica "TIPO-NUMERO_DE_DOCUMENTO" en vez de un ID interno
  // consecutivo, para que no se puedan adivinar ni enumerar otros registros.
  const qrContenido = datos.qrContenido;

  // El QR se referencia por URL remota (<img src="https://...">) usando el
  // propio endpoint del generador. Es el mecanismo que los clientes muestran
  // DENTRO del cuerpo del correo (Gmail, Outlook, móviles) y que NUNCA termina
  // como archivo adjunto. Solo si ambos proveedores fallaran en el momento del
  // envío se usa el respaldo "inlineImages + cid" (en Outlook ese respaldo
  // puede listarse como adjunto, por eso es la última opción).
  const urlQr = urlQRRemota_(qrContenido);

  let imgQrHtml = '';
  let qrCidBlob = null;
  if (urlQr) {
    imgQrHtml = '<img src="' + urlQr + '" width="220" height="220" style="max-width:100%;" alt="Código QR de acceso" />';
  } else {
    const qr = generarImagenQR_(qrContenido);
    if (qr.blob) {
      qrCidBlob = qr.blob;
      imgQrHtml = '<img src="cid:qrAcceso" width="220" height="220" alt="Código QR de acceso" />';
    } else {
      console.error('NO se pudo generar el QR para "' + qrContenido + '" (' + qr.error + ')');
    }
  }

  const asunto = 'Confirmación de inscripción · ' + CONFIG.EVENTO_NOMBRE;

  const cuerpoHtml =
    '<div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; color:#1a1a1a;">' +
      '<h2 style="color:#5b1e94;">¡Inscripción confirmada!</h2>' +
      '<p>Hola <strong>' + escapeHtml_(datos.nombreCompleto) + '</strong>,</p>' +
      '<p>Tu registro para el <strong>' + CONFIG.EVENTO_NOMBRE + '</strong> quedó confirmado como:</p>' +
      '<p style="background:#f4f0fa; padding:10px 14px; border-radius:8px;"><strong>' + escapeHtml_(datos.rolEtiqueta) + '</strong></p>' +
      '<ul style="line-height:1.6;">' +
        '<li><strong>Fechas:</strong> ' + CONFIG.EVENTO_FECHAS + '</li>' +
        '<li><strong>Horario:</strong> ' + CONFIG.EVENTO_HORARIO + '</li>' +
        '<li><strong>Lugar:</strong> ' + CONFIG.EVENTO_LUGAR + '</li>' +
      '</ul>' +
      '<p>Presenta el siguiente código QR en el ingreso al evento (puedes mostrarlo desde tu celular o impreso):</p>' +
      (imgQrHtml
        ? '<div style="text-align:center; margin:20px 0;">' + imgQrHtml + '</div>'
        : '<p><em>No fue posible generar la imagen del QR; contacta a la organización con tu número de documento.</em></p>') +
      '<p style="font-size:12px; color:#666;">Este código corresponde a tu tipo y número de documento y es personal e intransferible.</p>' +
      '<p>¡Nos vemos en el Bootcamp!<br>' + CONFIG.CORREO_REMITENTE_NOMBRE + '</p>' +
    '</div>';

  const opciones = { htmlBody: cuerpoHtml, name: CONFIG.CORREO_REMITENTE_NOMBRE };
  if (qrCidBlob) {
    opciones.inlineImages = { qrAcceso: qrCidBlob };
  }

  // El resultado de la entrega se reporta para que el frontend y la hoja
  // puedan avisar si el correo o el QR no pudieron generarse/despacharse.
  try {
    GmailApp.sendEmail(
      datos.correo,
      asunto,
      'Tu inscripción fue confirmada. Abre este correo en un cliente compatible con HTML (o descarga las imágenes) para ver tu código QR de acceso.',
      opciones
    );
    const metodo = urlQr ? 'QR remoto en el cuerpo' : (qrCidBlob ? 'QR inline (cid) de respaldo' : 'SIN QR');
    console.log('Correo de confirmación ENVIADO a ' + datos.correo + ' (' + metodo + ')');
    return { enviado: true, error: '', qrOk: !!urlQr || !!qrCidBlob, qrRemoto: !!urlQr, qrError: urlQr || qrCidBlob ? '' : (qr && qr.error || '') };
  } catch (err) {
    console.error('Error al enviar el correo de confirmación a ' + datos.correo + ':', err);
    return { enviado: false, error: String(err && err.message || err), qrOk: !!urlQr || !!qrCidBlob, qrRemoto: !!urlQr, qrError: urlQr || qrCidBlob ? '' : (qr && qr.error || '') };
  }
}

// Devuelve la URL del endpoint de generación que responde correctamente en el
// momento del envío (así el QR por URL funciona y no queda en adjunto).
function urlQRRemota_(contenido) {
  const proveedores = [
    'https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=12&data=' + encodeURIComponent(contenido),
    'https://quickchart.io/qr?text=' + encodeURIComponent(contenido) + '&size=360&margin=6'
  ];
  for (let i = 0; i < proveedores.length; i++) {
    try {
      const bytes = UrlFetchApp.fetch(proveedores[i]).getBlob().getBytes();
      if (bytes.length >= 50) {
        return proveedores[i];
      }
    } catch (err) {
      console.error('El proveedor de QR por URL (' + (i + 1) + ') falló: ' + proveedores[i], err);
    }
  }
  return '';
}

function generarImagenQR_(contenido) {
  const proveedores = [
    'https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=12&data=' + encodeURIComponent(contenido),
    'https://quickchart.io/qr?text=' + encodeURIComponent(contenido) + '&size=360&margin=6'
  ];
  let ultimoError = '';
  for (let i = 0; i < proveedores.length; i++) {
    try {
      const blob = UrlFetchApp.fetch(proveedores[i])
        .getBlob()
        .setContentType('image/png')
        .setName('qr-acceso.png');
      if (blob.getBytes().length < 50) {
        ultimoError = 'Respuesta vacía o inválida del proveedor ' + (i + 1);
        continue;
      }
      return { blob: blob, error: '' };
    } catch (err) {
      ultimoError = String(err && err.message || err);
      console.error('El proveedor de QR ' + (i + 1) + ' falló: ' + proveedores[i], err);
    }
  }
  return { blob: null, error: ultimoError };
}

/* -------------------------------- UTILIDADES -------------------------------- */

function getSheet_(nombre, encabezados) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(nombre);
  if (!sheet) {
    sheet = ss.insertSheet(nombre);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(encabezados);
    sheet.getRange(1, 1, 1, encabezados.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    return sheet;
  }
  // Migración segura: agrega al final los encabezados nuevos que falten en
  // hojas ya existentes, SIN tocar los datos ya guardados.
  const existentes = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    .map(function (v) { return String(v).trim(); });
  let colNueva = sheet.getLastColumn() + 1;
  encabezados.forEach(function (enc) {
    if (existentes.indexOf(enc) === -1) {
      const celda = sheet.getRange(1, colNueva);
      celda.setValue(enc);
      celda.setFontWeight('bold');
      colNueva++;
    }
  });
  return sheet;
}

function registrarEstadoCorreo_(sheet, resCorreo) {
  const colEstado = columnaEncabezado_(sheet, 'Estado del correo');
  if (colEstado <= 0) return;
  const fila = sheet.getLastRow();
  if (fila < 2) return;
  let estado;
  if (!resCorreo.enviado) {
    estado = 'ERROR: ' + resCorreo.error;
  } else if (resCorreo.qrOk) {
    estado = 'Enviado (con QR)';
  } else {
    estado = 'Enviado (SIN QR: ' + resCorreo.qrError + ')';
  }
  sheet.getRange(fila, colEstado).setValue(estado);
}

function yaRegistrado_(sheet, numeroDocumento, columnaNumeroDoc) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;
  const valores = sheet.getRange(2, columnaNumeroDoc, lastRow - 1, 1).getValues();
  return valores.some(function (fila) {
    return String(fila[0]).trim() === numeroDocumento;
  });
}

function columnaEncabezado_(sheet, encabezado) {
  if (sheet.getLastRow() === 0) return -1;
  const filaEncabezados = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  for (let i = 0; i < filaEncabezados.length; i++) {
    if (String(filaEncabezados[i]).trim() === encabezado) return i + 1;
  }
  return -1;
}

function limpiar(valor) {
  return (valor === undefined || valor === null) ? '' : String(valor).trim();
}

function esCorreoValido(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

function escapeHtml_(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Ejecuta esta función UNA sola vez desde el editor de Apps Script
 * (menú "Ejecutar" > seleccionar "setupSheets") para crear ambas hojas
 * con sus encabezados antes de desplegar la aplicación web.
 */
function setupSheets() {
  getSheet_(CONFIG.SHEET_APRENDICES, [
    'Fecha de Registro', 'Número de Ficha', 'Nombre Completo', 'Tipo de Documento',
    'Número de Documento', 'Centro SENA', 'Correo Electrónico', 'Código QR (contenido)',
    'Estado del correo'
  ]);
  getSheet_(CONFIG.SHEET_INVITADOS, [
    'Fecha de Registro', 'Empresa o Entidad', 'Nombre Completo', 'Tipo de Documento',
    'Número de Documento', 'Correo Electrónico', 'Código QR (contenido)',
    'Estado del correo'
  ]);
}
