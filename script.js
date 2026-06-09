const navToggle = document.querySelector('[data-nav-toggle]');
const nav = document.querySelector('[data-nav]');
const header = document.querySelector('[data-header]');

const BFNG_ENQUIRY_ENDPOINTS = [
  'https://ended-tech-venice-bread.trycloudflare.com/api/enquiry',
  'https://rxid.co.uk/api/bfng/enquiry'
];

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

window.addEventListener('scroll', () => {
  if (!header) return;
  header.style.boxShadow = window.scrollY > 8 ? '0 10px 30px rgba(0,0,0,0.06)' : 'none';
});

function setError(field, message) {
  if (!field) return;
  const wrapper = field.closest('label');
  const error = wrapper ? wrapper.querySelector('.error') : null;
  if (error) error.textContent = message || '';
  field.setAttribute('aria-invalid', message ? 'true' : 'false');
}

function validateEmail(value) {
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validatePhone(value) {
  const cleaned = value.replace(/[\s()-]/g, '');
  return /^(\+44|0)\d{9,10}$/.test(cleaned);
}

function buildMailtoFallback(subject, fields) {
  const recipient = 'enquiries@bfng.co.uk';
  const lines = Object.entries(fields)
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
    .map(([key, value]) => `${key}: ${value}`);
  const body = encodeURIComponent(lines.join('\n'));
  return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${body}`;
}

async function postEnquiry(payload) {
  let lastError = null;

  for (const endpoint of BFNG_ENQUIRY_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      let body = null;
      try {
        body = await response.json();
      } catch (_) {
        body = null;
      }

      if (response.ok && (!body || body.ok !== false)) {
        return { ok: true, endpoint, body };
      }

      lastError = new Error(body && body.error ? body.error : `Submission failed with HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Submission failed');
}

function setSubmitState(button, isSubmitting, submittingText = 'Sending...') {
  if (!button) return;
  if (isSubmitting) {
    button.dataset.originalText = button.textContent;
    button.textContent = submittingText;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
  } else {
    button.textContent = button.dataset.originalText || button.textContent;
    button.disabled = false;
    button.removeAttribute('aria-busy');
  }
}

function showSuccess(form, message) {
  const success = form.querySelector('.form-success');
  if (success) {
    success.hidden = false;
    success.textContent = message;
  }
}

function showFormError(form, message, fallbackUrl) {
  const success = form.querySelector('.form-success');
  if (success) {
    success.hidden = false;
    success.innerHTML = `${message} <a href="${fallbackUrl}">Send the enquiry by email instead.</a>`;
  }
}

const form = document.getElementById('enquiryForm');
if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const fields = Object.fromEntries(data.entries());
    let valid = true;

    form.querySelectorAll('.error').forEach((node) => { node.textContent = ''; });
    form.querySelectorAll('[aria-invalid]').forEach((node) => node.removeAttribute('aria-invalid'));

    ['name', 'trade', 'phone', 'area', 'interest'].forEach((name) => {
      const field = form.elements[name];
      if (!fields[name] || !String(fields[name]).trim()) {
        setError(field, 'Required');
        valid = false;
      }
    });

    if (fields.phone && !validatePhone(fields.phone)) {
      setError(form.elements.phone, 'Enter a valid UK phone number');
      valid = false;
    }

    if (fields.email && !validateEmail(fields.email)) {
      setError(form.elements.email, 'Enter a valid email address');
      valid = false;
    }

    if (!form.elements.consent.checked) {
      const consentError = form.querySelector('.consent-error');
      if (consentError) consentError.textContent = 'Consent is required';
      valid = false;
    }

    if (!valid) return;

    const payload = {
      name: fields.name.trim(),
      business_name: fields.business_name ? fields.business_name.trim() : '',
      trade: fields.trade,
      phone: fields.phone.trim(),
      email: fields.email ? fields.email.trim() : '',
      area: fields.area.trim(),
      service_interest: fields.interest,
      message: fields.message ? fields.message.trim() : '',
      source_page: window.location.href,
      consent: Boolean(form.elements.consent.checked)
    };

    const fallbackUrl = buildMailtoFallback('BFNG missed-call recovery install enquiry', {
      Name: payload.name,
      Trade: payload.trade,
      Phone: payload.phone,
      Email: payload.email,
      Area: payload.area,
      'Main issue': payload.service_interest,
      Message: payload.message
    });

    const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
    setSubmitState(submitButton, true);

    try {
      await postEnquiry(payload);
      form.reset();
      showSuccess(form, 'Enquiry received. BFNG will contact you shortly.');
    } catch (error) {
      showFormError(form, 'The form could not submit automatically.', fallbackUrl);
    } finally {
      setSubmitState(submitButton, false);
    }
  });
}

const roiCalculator = document.getElementById('roiCalculator');
if (roiCalculator) {
  const formatGBP = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 });
  const output = document.getElementById('roiMonthly');
  const detail = document.getElementById('roiDetail');
  const calculate = () => {
    const data = new FormData(roiCalculator);
    const missedCalls = Math.max(0, Number(data.get('missedCalls') || 0));
    const jobValue = Math.max(0, Number(data.get('jobValue') || 0));
    const closeRate = Math.min(100, Math.max(0, Number(data.get('closeRate') || 0))) / 100;
    const recoverRate = Math.min(100, Math.max(0, Number(data.get('recoverRate') || 0))) / 100;
    const monthlyExposure = missedCalls * 4.33 * jobValue * closeRate * recoverRate;
    if (output) output.textContent = `${formatGBP.format(monthlyExposure)}/mo`;
    if (detail) detail.textContent = `${missedCalls} missed calls/week × ${formatGBP.format(jobValue)} average job × ${Math.round(closeRate * 100)}% close rate × ${Math.round(recoverRate * 100)}% recoverable share.`;
  };
  roiCalculator.addEventListener('input', calculate);
  calculate();
}

const auditForm = document.getElementById('auditForm');
if (auditForm) {
  auditForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const fields = Object.fromEntries(new FormData(auditForm).entries());
    const submitButton = auditForm.querySelector('button[type="submit"], input[type="submit"]');

    const payload = {
      name: fields.name ? fields.name.trim() : '',
      trade: fields.trade ? fields.trade.trim() : '',
      phone: fields.phone ? fields.phone.trim() : '',
      area: fields.area ? fields.area.trim() : '',
      service_interest: 'Missed-job audit request',
      message: [
        fields.missed_calls ? `Missed calls per week: ${fields.missed_calls}` : '',
        fields.avg_job ? `Average job value: £${fields.avg_job}` : '',
        fields.process ? `Current process: ${fields.process}` : ''
      ].filter(Boolean).join('\n'),
      source_page: window.location.href,
      consent: true
    };

    const fallbackUrl = buildMailtoFallback('BFNG missed-job audit request', {
      Name: payload.name,
      Trade: payload.trade,
      Phone: payload.phone,
      Area: payload.area,
      'Missed calls per week': fields.missed_calls,
      'Average job value': fields.avg_job,
      'Current process': fields.process
    });

    setSubmitState(submitButton, true);

    try {
      await postEnquiry(payload);
      auditForm.reset();
      showSuccess(auditForm, 'Audit request received. BFNG will contact you shortly.');
    } catch (error) {
      showFormError(auditForm, 'The audit request could not submit automatically.', fallbackUrl);
    } finally {
      setSubmitState(submitButton, false);
    }
  });
}
