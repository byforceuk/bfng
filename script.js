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

const form = document.getElementById('enquiryForm');

const endpoint = ''; // Example later: '/api/trade-enquiry' or 'https://rxid.co.uk/api/trade-enquiry'

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
      trade: fields.trade,
      phone: fields.phone.trim(),
      email: fields.email ? fields.email.trim() : '',
      area: fields.area.trim(),
      interest: fields.interest,
      message: fields.message ? fields.message.trim() : '',
      source: 'bfng_missed_job_recovery_site',
      submitted_at: new Date().toISOString()
    };

    const success = form.querySelector('.form-success');
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;

    try {
      if (endpoint) {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);
      } else {
        console.log('BFNG enquiry payload:', payload);
      }

      if (success) {
        success.hidden = false;
        success.textContent = 'Recovery enquiry ready. In this static version it is logged in the browser console until you connect a backend endpoint.';
      }
      form.reset();
    } catch (error) {
      if (success) {
        success.hidden = false;
        success.textContent = 'Could not send the recovery enquiry. Check the endpoint in script.js.';
      }
      console.error(error);
    } finally {
      if (submitButton) submitButton.disabled = false;
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
    const payload = Object.fromEntries(new FormData(auditForm).entries());
    payload.source = 'bfng_missed_job_audit_static';
    payload.submitted_at = new Date().toISOString();
    console.log('BFNG audit payload awaiting backend:', payload);
    const success = auditForm.querySelector('.form-success');
    if (success) {
      success.hidden = false;
      success.textContent = 'Audit request prepared. Static version: connect this to /api/missed-job-audit next.';
    }
  });
}
