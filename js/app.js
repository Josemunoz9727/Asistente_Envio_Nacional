'use strict';

/**
 * Asistente de envío nacional — app.js
 * Prototipo académico. JavaScript nativo, sin dependencias externas.
 * Implementa:
 *   1) Selección visual de un servicio mediante classList
 *   2) Mostrar/ocultar un bloque de datos adicionales
 *   3) Validación del formulario en el evento submit + preventDefault()
 *   4) Generación/actualización dinámica del panel de resultado
 *   + Regla de recomendación por urgencia y acción de limpiar formulario
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('envio-form');
  const serviceCards = document.querySelectorAll('.service-card');
  const selectButtons = document.querySelectorAll('.btn-select');
  const toggleExtraBtn = document.getElementById('toggle-datos-extra');
  const extraData = document.getElementById('datos-extra');
  const resultPanel = document.getElementById('resultado-panel');
  const clearBtn = document.getElementById('btn-limpiar');
  const urgencyFieldset = document.querySelector('.urgency-fieldset');

  const SERVICE_NAMES = {
    basico: 'Básico',
    estandar: 'Estándar',
    prioritario: 'Prioritario'
  };

  const URGENCY_TO_SERVICE = {
    baja: 'basico',
    media: 'estandar',
    alta: 'prioritario'
  };

  /* -----------------------------------------------------------
     1) Selección visual de un servicio mediante classList
     ----------------------------------------------------------- */
  function selectService(serviceKey) {
    serviceCards.forEach((card) => {
      card.classList.toggle('is-selected', card.dataset.service === serviceKey);
    });
  }

  selectButtons.forEach((button) => {
    button.addEventListener('click', () => {
      selectService(button.dataset.service);
    });
  });

  /* -----------------------------------------------------------
     2) Mostrar/ocultar bloque de datos adicionales
     ----------------------------------------------------------- */
  toggleExtraBtn.addEventListener('click', () => {
    const isCurrentlyHidden = extraData.classList.contains('is-hidden');
    extraData.classList.toggle('is-hidden', !isCurrentlyHidden);
    toggleExtraBtn.setAttribute('aria-expanded', String(isCurrentlyHidden));
    toggleExtraBtn.textContent = isCurrentlyHidden
      ? '− Ocultar datos adicionales de contacto'
      : '+ Agregar datos adicionales de contacto';
  });

  /* -----------------------------------------------------------
     Utilidades de validación
     ----------------------------------------------------------- */
  function setFieldState(input, valid) {
    const group = input.closest('.form-group');
    if (!group) return;
    group.classList.toggle('is-error', !valid);
    group.classList.toggle('is-valid', valid);
  }

  function isPositiveNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0;
  }

  function validateForm() {
    let isValid = form.checkValidity();

    const numericFields = [
      form.elements.peso,
      form.elements.largo,
      form.elements.ancho,
      form.elements.alto
    ];

    numericFields.forEach((field) => {
      const fieldIsValid = field.checkValidity() && isPositiveNumber(field.value);
      setFieldState(field, fieldIsValid);
      if (!fieldIsValid) isValid = false;
    });

    [
      form.elements.origen,
      form.elements.destino,
      form.elements.tipoEnvio,
      form.elements.correo
    ].forEach((field) => setFieldState(field, field.checkValidity()));

    const urgenciaChecked = form.querySelector('input[name="urgencia"]:checked');
    urgencyFieldset.classList.toggle('is-error', !urgenciaChecked);
    if (!urgenciaChecked) isValid = false;

    return isValid;
  }

  /* -----------------------------------------------------------
     3) Validar el formulario al enviarlo (submit + preventDefault)
     4) Generar/actualizar el panel de resultado dinámicamente
     ----------------------------------------------------------- */
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!validateForm()) {
      form.reportValidity();
      return;
    }

    const data = {
      origen: form.elements.origen.value,
      destino: form.elements.destino.value,
      tipoEnvio: form.elements.tipoEnvio.value,
      peso: form.elements.peso.value,
      urgencia: form.querySelector('input[name="urgencia"]:checked').value
    };

    // Regla académica simple: baja = Básico, media = Estándar, alta = Prioritario
    const suggestedServiceKey = URGENCY_TO_SERVICE[data.urgencia];

    renderResult(data, suggestedServiceKey);
    selectService(suggestedServiceKey);

    resultPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  function renderResult(data, suggestedServiceKey) {
    resultPanel.innerHTML = '';

    const heading = document.createElement('h3');
    heading.textContent = 'Resumen de tu envío';

    const list = document.createElement('dl');
    const rows = [
      ['Origen', data.origen],
      ['Destino', data.destino],
      ['Tipo de envío', data.tipoEnvio],
      ['Peso', `${data.peso} kg`]
    ];

    rows.forEach(([label, value]) => {
      const dt = document.createElement('dt');
      dt.textContent = label;
      const dd = document.createElement('dd');
      dd.textContent = value;
      list.appendChild(dt);
      list.appendChild(dd);
    });

    const badge = document.createElement('p');
    badge.className = 'result-badge';
    badge.textContent = `Servicio sugerido: ${SERVICE_NAMES[suggestedServiceKey]}`;

    resultPanel.appendChild(heading);
    resultPanel.appendChild(list);
    resultPanel.appendChild(badge);
    resultPanel.classList.remove('is-hidden');
  }

  /* -----------------------------------------------------------
     Acción para limpiar el formulario y volver al estado inicial
     ----------------------------------------------------------- */
  clearBtn.addEventListener('click', () => {
    form.reset();

    document.querySelectorAll('.form-group').forEach((group) => {
      group.classList.remove('is-error', 'is-valid');
    });
    urgencyFieldset.classList.remove('is-error');

    serviceCards.forEach((card) => card.classList.remove('is-selected'));

    resultPanel.classList.add('is-hidden');
    resultPanel.innerHTML = '';

    extraData.classList.add('is-hidden');
    toggleExtraBtn.setAttribute('aria-expanded', 'false');
    toggleExtraBtn.textContent = '+ Agregar datos adicionales de contacto';
  });
});
