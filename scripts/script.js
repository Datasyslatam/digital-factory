document.addEventListener('DOMContentLoaded', () => {
  // 1. Manejo dinámico de roles
  const roleSelector = document.getElementById('roleSelector');
  const radioAprendiz = document.getElementById('radioAprendiz');
  const radioInvitado = document.getElementById('radioInvitado');
  
  const fieldsAprendiz = document.getElementById('fieldsAprendiz');
  const fieldsInvitado = document.getElementById('fieldsInvitado');
  
  const bootcampForm = document.getElementById('bootcampForm');
  const successModal = document.getElementById('successModal');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const modalSummaryContent = document.getElementById('modalSummaryContent');

  // Inputs Aprendiz
  const numFicha = document.getElementById('numFicha');
  const nombreAprendiz = document.getElementById('nombreAprendiz');
  const cedulaAprendiz = document.getElementById('cedulaAprendiz');
  const centroPertenencia = document.getElementById('centroPertenencia');

  // Inputs Invitado
  const empresaInvitado = document.getElementById('empresaInvitado');
  const nombreInvitado = document.getElementById('nombreInvitado');
  const cedulaInvitado = document.getElementById('cedulaInvitado');

  function setRole(role) {
    if (role === 'Aprendiz') {
      if (fieldsAprendiz) fieldsAprendiz.style.display = 'flex';
      if (fieldsInvitado) fieldsInvitado.style.display = 'none';

      if (roleSelector) roleSelector.value = 'Aprendiz';
      if (radioAprendiz) radioAprendiz.checked = true;

      if (numFicha) numFicha.setAttribute('required', 'true');
      if (nombreAprendiz) nombreAprendiz.setAttribute('required', 'true');
      if (cedulaAprendiz) cedulaAprendiz.setAttribute('required', 'true');
      if (centroPertenencia) centroPertenencia.setAttribute('required', 'true');

      if (empresaInvitado) empresaInvitado.removeAttribute('required');
      if (nombreInvitado) nombreInvitado.removeAttribute('required');
      if (cedulaInvitado) cedulaInvitado.removeAttribute('required');

      if (fieldsInvitado) clearErrors(fieldsInvitado);
    } else {
      if (fieldsAprendiz) fieldsAprendiz.style.display = 'none';
      if (fieldsInvitado) fieldsInvitado.style.display = 'flex';

      if (roleSelector) roleSelector.value = 'Invitado';
      if (radioInvitado) radioInvitado.checked = true;

      if (empresaInvitado) empresaInvitado.setAttribute('required', 'true');
      if (nombreInvitado) nombreInvitado.setAttribute('required', 'true');
      if (cedulaInvitado) cedulaInvitado.setAttribute('required', 'true');

      if (numFicha) numFicha.removeAttribute('required');
      if (nombreAprendiz) nombreAprendiz.removeAttribute('required');
      if (cedulaAprendiz) cedulaAprendiz.removeAttribute('required');
      if (centroPertenencia) centroPertenencia.removeAttribute('required');

      if (fieldsAprendiz) clearErrors(fieldsAprendiz);
    }
  }

  function clearErrors(container) {
    container.querySelectorAll('.input-group').forEach(grp => grp.classList.remove('has-error'));
  }

  if (roleSelector) {
    roleSelector.addEventListener('change', (e) => setRole(e.target.value));
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

  setRole('Aprendiz');

  document.querySelectorAll('.form-control').forEach(input => {
    input.addEventListener('input', () => {
      const group = input.closest('.input-group');
      if (group && input.value.trim() !== '') {
        group.classList.remove('has-error');
      }
    });
  });

  // Validación y Envío
  if (bootcampForm) {
    bootcampForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const currentRole = roleSelector ? roleSelector.value : 'Aprendiz';
      let isValid = true;
      let summaryData = {};

      if (currentRole === 'Aprendiz') {
        const inputs = [
          { el: numFicha, key: 'Número de Ficha' },
          { el: nombreAprendiz, key: 'Nombre Completo' },
          { el: cedulaAprendiz, key: 'Cédula / Documento' },
          { el: centroPertenencia, key: 'Centro SENA' }
        ];

        inputs.forEach(item => {
          if (!item.el) return;
          const val = item.el.value.trim();
          const grp = item.el.closest('.input-group');
          if (!val) {
            isValid = false;
            if (grp) grp.classList.add('has-error');
          } else {
            if (grp) grp.classList.remove('has-error');
            summaryData[item.key] = val;
          }
        });
      } else {
        const inputs = [
          { el: empresaInvitado, key: 'Empresa / Entidad' },
          { el: nombreInvitado, key: 'Nombre Completo' },
          { el: cedulaInvitado, key: 'Cédula de Ciudadanía' }
        ];

        inputs.forEach(item => {
          if (!item.el) return;
          const val = item.el.value.trim();
          const grp = item.el.closest('.input-group');
          if (!val) {
            isValid = false;
            if (grp) grp.classList.add('has-error');
          } else {
            if (grp) grp.classList.remove('has-error');
            summaryData[item.key] = val;
          }
        });
      }

      if (!isValid) {
        const firstError = document.querySelector('.input-group.has-error input');
        if (firstError) firstError.focus();
        return;
      }

      // Modal de Éxito
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
    });
  }

  if (btnCloseModal && successModal) {
    btnCloseModal.addEventListener('click', () => successModal.classList.remove('active'));
  }

  if (successModal) {
    successModal.addEventListener('click', (e) => {
      if (e.target === successModal) successModal.classList.remove('active');
    });
  }

  // 2. Control de Audio del Video
  const bootcampVideo = document.getElementById('bootcampVideo');
  const toggleAudioBtn = document.getElementById('toggleAudioBtn');
  const audioIcon = document.getElementById('audioIcon');
  const audioText = document.getElementById('audioText');

  if (toggleAudioBtn && bootcampVideo) {
    toggleAudioBtn.addEventListener('click', () => {
      if (bootcampVideo.muted) {
        bootcampVideo.muted = false;
        if (audioIcon) audioIcon.className = 'fa-solid fa-volume-high';
        if (audioText) audioText.textContent = 'Silenciar';
      } else {
        bootcampVideo.muted = true;
        if (audioIcon) audioIcon.className = 'fa-solid fa-volume-xmark';
        if (audioText) audioText.textContent = 'Activar Audio';
      }
    });
  }

  // 3. Cuenta Regresiva
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

  /* ==========================================================================
     4. MEDIDAS DE SEGURIDAD Y PROTECCIÓN DE CONTENIDO (FRONTEND)
     ========================================================================== */

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

  // C. Bloqueo de Arrastre de Imágenes (Drag & Drop)
  document.addEventListener('dragstart', (e) => {
    if (e.target && (e.target.nodeName === 'IMG' || e.target.closest('img'))) {
      e.preventDefault();
    }
  });
});
