const navToggle = document.querySelector('[data-nav-toggle]');
const nav = document.querySelector('[data-nav]');
const header = document.querySelector('[data-header]');

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

function openPreparedEmail(subject, fields) {
  const recipient = 'email@bfng.co.uk';
  const lines = Object.entries(fields)
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
    .map(([key, value]) => `${key}: ${value}`);
  const body = encodeURIComponent(lines.join('\n'));
  window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${body}`;
}

const form = document.getElementById('enquiryForm');
if (form) {
  form.addEventListener('submit', (event) => {
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

    openPreparedEmail('BFNG missed-call recovery install enquiry', {
      Name: fields.name.trim(),
      Trade: fields.trade,
      Phone: fields.phone.trim(),
      Email: fields.email ? fields.email.trim() : '',
      Area: fields.area.trim(),
      'Main issue': fields.interest,
      Message: fields.message ? fields.message.trim() : ''
    });

    const success = form.querySelector('.form-success');
    if (success) {
      success.hidden = false;
      success.textContent = 'Your email app should now open with the enquiry prepared. Send the email to complete your request.';
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
  auditForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(auditForm).entries());
    openPreparedEmail('BFNG missed-job audit request', {
      Name: fields.name,
      Trade: fields.trade,
      Phone: fields.phone,
      Area: fields.area,
      'Missed calls per week': fields.missed_calls,
      'Average job value': fields.avg_job,
      'Current process': fields.process
    });
    const success = auditForm.querySelector('.form-success');
    if (success) {
      success.hidden = false;
      success.textContent = 'Your email app should now open with the audit request prepared. Send the email to complete your request.';
    }
  });
}
