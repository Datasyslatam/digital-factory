/* ==========================================================================
   SCRIPT.JS — Lógica del Formulario Dinámico, Backend Google Sheets & Seguridad
   Bootcamp Digital Factory & IA 2026 (SENA Regional Atlántico)
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. CONFIGURACIÓN DEL BACKEND (Google Apps Script + Google Sheets)
   -------------------------------------------------------------------------- */
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwn1utVhQJcmX3EUR4jY5tfSM4ud9GBOYhhcbocbT_buOcJpzA3wb1VXcFvQrwlBIuH/exec';

document.addEventListener('DOMContentLoaded', () => {
  /* ------------------------------------------------------------------------
     2. MANEJO DINÁMICO DE ROLES EN EL FORMULARIO
     ------------------------------------------------------------------------ */
  const radioAprendiz = document.getElementById('radioAprendiz');
  const radioInvitado = document.getElementById('radioInvitado');
  
  const fieldsAprendiz = document.getElementById('fieldsAprendiz');
  const fieldsInvitado = document.getElementById('fieldsInvitado');
  
  const bootcampForm = document.getElementById('bootcampForm');
  const successModal = document.getElementById('successModal');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const modalSummaryContent = document.getElementById('modalSummaryContent');
  const formAlert = document.getElementById('formAlert');
  const formAlertText = document.getElementById('formAlertText');
  const btnSubmit = document.getElementById('btnSubmit');
  const btnSubmitText = document.getElementById('btnSubmitText');
  const btnSubmitIcon = document.getElementById('btnSubmitIcon');

  // Inputs Aprendiz
  const numFicha = document.getElementById('numFicha');
  const nombreAprendiz = document.getElementById('nombreAprendiz');
  const tipoDocAprendiz = document.getElementById('tipoDocAprendiz');
  const cedulaAprendiz = document.getElementById('cedulaAprendiz');
  const correoAprendiz = document.getElementById('correoAprendiz');
  const centroPertenencia = document.getElementById('centroPertenencia');

  // Inputs Invitado
  const empresaInvitado = document.getElementById('empresaInvitado');
  const nombreInvitado = document.getElementById('nombreInvitado');
  const tipoDocInvitado = document.getElementById('tipoDocInvitado');
  const cedulaInvitado = document.getElementById('cedulaInvitado');
  const correoInvitado = document.getElementById('correoInvitado');

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setRole(role) {
    if (role === 'Aprendiz') {
      if (fieldsAprendiz) fieldsAprendiz.style.display = 'grid';
      if (fieldsInvitado) fieldsInvitado.style.display = 'none';

      if (radioAprendiz) radioAprendiz.checked = true;

      // Requeridos para Aprendiz
      if (numFicha) numFicha.setAttribute('required', 'true');
      if (nombreAprendiz) nombreAprendiz.setAttribute('required', 'true');
      if (tipoDocAprendiz) tipoDocAprendiz.setAttribute('required', 'true');
      if (cedulaAprendiz) cedulaAprendiz.setAttribute('required', 'true');
      if (correoAprendiz) correoAprendiz.setAttribute('required', 'true');
      if (centroPertenencia) centroPertenencia.setAttribute('required', 'true');

      // No requeridos para Invitado
      if (empresaInvitado) empresaInvitado.removeAttribute('required');
      if (nombreInvitado) nombreInvitado.removeAttribute('required');
      if (tipoDocInvitado) tipoDocInvitado.removeAttribute('required');
      if (cedulaInvitado) cedulaInvitado.removeAttribute('required');
      if (correoInvitado) correoInvitado.removeAttribute('required');

      if (fieldsInvitado) clearErrors(fieldsInvitado);
    } else {
      if (fieldsAprendiz) fieldsAprendiz.style.display = 'none';
      if (fieldsInvitado) fieldsInvitado.style.display = 'grid';

      if (radioInvitado) radioInvitado.checked = true;

      // Requeridos para Invitado
      if (nombreInvitado) nombreInvitado.setAttribute('required', 'true');
      if (tipoDocInvitado) tipoDocInvitado.setAttribute('required', 'true');
      if (cedulaInvitado) cedulaInvitado.setAttribute('required', 'true');
      if (correoInvitado) correoInvitado.setAttribute('required', 'true');

      // No requeridos para Aprendiz
      if (numFicha) numFicha.removeAttribute('required');
      if (nombreAprendiz) nombreAprendiz.removeAttribute('required');
      if (tipoDocAprendiz) tipoDocAprendiz.removeAttribute('required');
      if (cedulaAprendiz) cedulaAprendiz.removeAttribute('required');
      if (correoAprendiz) correoAprendiz.removeAttribute('required');
      if (centroPertenencia) centroPertenencia.removeAttribute('required');

      if (fieldsAprendiz) clearErrors(fieldsAprendiz);
    }

    if (formAlert) formAlert.classList.remove('active');
  }

  function clearErrors(container) {
    if (!container) return;
    container.querySelectorAll('.input-group').forEach(grp => grp.classList.remove('has-error'));
  }

  if (radioAprendiz) {
    radioAprendiz.addEventListener('change', () => {
      if (radioAprendiz.checked) setRole('Aprendiz');
    });
  }

  if (radioInvitado) {
    radioInvitado.addEventListener('change', () => {
      if (radioInvitado.checked) setRole('Invitado');
    });
  }

  // Inicializar en Aprendiz
  setRole('Aprendiz');

  // Limpiar errores al escribir
  document.querySelectorAll('.form-control').forEach(input => {
    ['input', 'change'].forEach(evt => {
      input.addEventListener(evt, () => {
        const group = input.closest('.input-group');
        if (group && input.value.trim() !== '') {
          group.classList.remove('has-error');
        }
      });
    });
  });

  function setSubmitLoading(isLoading) {
    if (!btnSubmit) return;
    btnSubmit.disabled = isLoading;
    if (btnSubmitText) btnSubmitText.textContent = isLoading ? 'Enviando registro...' : 'Confirmar e Inscribirme';
    if (btnSubmitIcon) btnSubmitIcon.className = isLoading ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-arrow-right';
  }

  function showFormError(message) {
    if (!formAlert) return;
    if (formAlertText) formAlertText.textContent = message;
    formAlert.classList.add('active');
  }

  /* ------------------------------------------------------------------------
     3. VALIDACIÓN Y ENVÍO A GOOGLE SHEETS VIA APPS SCRIPT
     ------------------------------------------------------------------------ */
  if (bootcampForm) {
    bootcampForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (formAlert) formAlert.classList.remove('active');

      const currentRole = (radioInvitado && radioInvitado.checked) ? 'Invitado' : 'Aprendiz';
      let isValid = true;
      let summaryData = {};
      let payload = { role: currentRole };

      if (currentRole === 'Aprendiz') {
        const inputs = [
          { el: numFicha, key: 'Número de Ficha', field: 'numFicha' },
          { el: nombreAprendiz, key: 'Nombre Completo', field: 'nombreCompleto' },
          { el: tipoDocAprendiz, key: 'Tipo de Documento', field: 'tipoDocumento' },
          { el: cedulaAprendiz, key: 'Número de Documento', field: 'numeroDocumento' },
          { el: correoAprendiz, key: 'Correo Electrónico', field: 'correo' },
          { el: centroPertenencia, key: 'Centro SENA', field: 'centro' }
        ];

        inputs.forEach(item => {
          if (!item.el) return;
          const val = item.el.value.trim();
          const grp = item.el.closest('.input-group');
          const isEmailField = item.el === correoAprendiz;
          const invalid = !val || (isEmailField && !EMAIL_REGEX.test(val));
          if (invalid) {
            isValid = false;
            if (grp) grp.classList.add('has-error');
          } else {
            if (grp) grp.classList.remove('has-error');
            summaryData[item.key] = val;
            payload[item.field] = val;
          }
        });
      } else {
        const inputs = [
          { el: nombreInvitado, key: 'Nombre Completo', field: 'nombreCompleto' },
          { el: tipoDocInvitado, key: 'Tipo de Documento', field: 'tipoDocumento' },
          { el: cedulaInvitado, key: 'Número de Documento', field: 'numeroDocumento' },
          { el: correoInvitado, key: 'Correo Electrónico', field: 'correo' }
        ];

        inputs.forEach(item => {
          if (!item.el) return;
          const val = item.el.value.trim();
          const grp = item.el.closest('.input-group');
          const isEmailField = item.el === correoInvitado;
          const invalid = !val || (isEmailField && !EMAIL_REGEX.test(val));
          if (invalid) {
            isValid = false;
            if (grp) grp.classList.add('has-error');
          } else {
            if (grp) grp.classList.remove('has-error');
            summaryData[item.key] = val;
            payload[item.field] = val;
          }
        });

        // Empresa / Entidad (opcional)
        if (empresaInvitado) {
          const empresaVal = empresaInvitado.value.trim();
          if (empresaVal) {
            summaryData['Empresa / Entidad'] = empresaVal;
            payload.empresa = empresaVal;
          }
        }
      }

      if (!isValid) {
        const firstError = document.querySelector('.input-group.has-error input, .input-group.has-error select');
        if (firstError) firstError.focus();
        return;
      }

      if (!GAS_WEB_APP_URL || GAS_WEB_APP_URL.trim() === '' || GAS_WEB_APP_URL.indexOf('PEGA_AQUI_TU_URL') !== -1) {
        showFormError('El formulario aún no está conectado a la base de datos. Configura GAS_WEB_APP_URL en scripts/script.js.');
        return;
      }

      setSubmitLoading(true);

      try {
        const response = await fetch(GAS_WEB_APP_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!result || result.result !== 'success') {
          throw new Error((result && result.message) || 'Respuesta inválida del servidor.');
        }

        // Poblar Modal de Éxito
        if (modalSummaryContent) {
          let summaryHTML = `<div><span class="field">Rol registrado:</span> <span class="val">${currentRole}</span></div>`;
          for (const [key, val] of Object.entries(summaryData)) {
            summaryHTML += `<div><span class="field">${key}:</span> <span class="val">${val}</span></div>`;
          }
          modalSummaryContent.innerHTML = summaryHTML;
        }

        if (successModal) successModal.classList.add('active');
        bootcampForm.reset();
        setRole(currentRole);
      } catch (err) {
        console.error('Error al enviar el registro:', err);
        showFormError('No pudimos registrar tu inscripción. Verifica tu conexión e inténtalo de nuevo.');
      } finally {
        setSubmitLoading(false);
      }
    });
  }

  // Cerrar Modal de Éxito
  if (btnCloseModal && successModal) {
    btnCloseModal.addEventListener('click', () => successModal.classList.remove('active'));
  }

  if (successModal) {
    successModal.addEventListener('click', (e) => {
      if (e.target === successModal) successModal.classList.remove('active');
    });
  }

  /* ------------------------------------------------------------------------
     4. CONTADOR REGRESIVO INTERACTIVO (DÍAS, HORAS, MINUTOS, SEGUNDOS)
     Target: 22 de Septiembre de 2026 a las 08:00 a.m. (COT / UTC-5)
     ------------------------------------------------------------------------ */
  const eventDate = new Date('2026-09-22T08:00:00-05:00').getTime();
  const elDays = document.getElementById('cdDays');
  const elHours = document.getElementById('cdHours');
  const elMin = document.getElementById('cdMinutes');
  const elSec = document.getElementById('cdSeconds');

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = eventDate - now;

    if (distance < 0) {
      if (elDays) elDays.textContent = '00';
      if (elHours) elHours.textContent = '00';
      if (elMin) elMin.textContent = '00';
      if (elSec) elSec.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (elDays) elDays.textContent = days.toString().padStart(2, '0');
    if (elHours) elHours.textContent = hours.toString().padStart(2, '0');
    if (elMin) elMin.textContent = minutes.toString().padStart(2, '0');
    if (elSec) elSec.textContent = seconds.toString().padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ------------------------------------------------------------------------
     5. MEDIDAS DE SEGURIDAD Y PROTECCIÓN DE CONTENIDO FRONTEND
     ------------------------------------------------------------------------ */

  // A. Bloqueo de Clic Derecho (Menú contextual)
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  // B. Bloqueo de Atajos de Teclado (DevTools, Código Fuente, Guardar)
  document.addEventListener('keydown', (e) => {
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;
    const isShift = e.shiftKey;
    const key = e.key ? e.key.toUpperCase() : '';
    const keyCode = e.keyCode || e.which;

    // 1. F12 (Herramientas de Desarrollador)
    if (key === 'F12' || keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // 2. DevTools: Ctrl+Shift+I / Cmd+Opt+I (Inspector)
    //              Ctrl+Shift+J / Cmd+Opt+J (Consola)
    //              Ctrl+Shift+C / Cmd+Opt+C (Selector de Elementos)
    if (isCtrlOrCmd && isShift && (key === 'I' || key === 'J' || key === 'C' || keyCode === 73 || keyCode === 74 || keyCode === 67)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // 3. Ver Código Fuente: Ctrl+U / Cmd+U
    if (isCtrlOrCmd && (key === 'U' || keyCode === 85)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // 4. Guardar Página: Ctrl+S / Cmd+S
    if (isCtrlOrCmd && (key === 'S' || keyCode === 83)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  });

  // C. Bloqueo de Arrastre de Imágenes
  document.addEventListener('dragstart', (e) => {
    if (e.target && (e.target.nodeName === 'IMG' || e.target.closest('img'))) {
      e.preventDefault();
    }
  });
});
