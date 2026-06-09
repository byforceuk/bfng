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
  const wrapper = field.closest('label') || field.closest('.consent-row');
  const error = wrapper ? wrapper.querySelector('.error') : null;
  if (error) error.textContent = message || '';
  field.setAttribute('aria-invalid', message ? 'true' : 'false');
  if (wrapper) wrapper.classList.toggle('field-invalid', Boolean(message));
}

function getFieldLabel(field) {
  const wrapper = field ? field.closest('label') : null;
  if (!wrapper) return 'This field';
  const ownText = Array.from(wrapper.childNodes)
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent.trim())
    .filter(Boolean)
    .join(' ')
    .trim();
  return ownText || field.getAttribute('name')?.replace(/_/g, ' ') || 'This field';
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


const onboardingForm = document.getElementById('onboardingForm');
if (onboardingForm) {
  const steps = Array.from(onboardingForm.querySelectorAll('.wizard-step'));
  const nextButton = onboardingForm.querySelector('[data-wizard-next]');
  const backButton = onboardingForm.querySelector('[data-wizard-back]');
  const submitButton = onboardingForm.querySelector('[data-wizard-submit]');
  const currentStepNode = onboardingForm.querySelector('[data-current-step]');
  const totalStepsNode = onboardingForm.querySelector('[data-total-steps]');
  const progressBar = onboardingForm.querySelector('[data-progress-bar]');
  let currentStep = 0;

  if (totalStepsNode) totalStepsNode.textContent = String(steps.length);

  const requiredFieldsForStep = (step) => Array.from(step.querySelectorAll('[required]'));

  const clearStepErrors = (step) => {
    step.querySelectorAll('.error').forEach((node) => { node.textContent = ''; });
    step.querySelectorAll('[aria-invalid]').forEach((node) => node.removeAttribute('aria-invalid'));
    step.querySelectorAll('.field-invalid').forEach((node) => node.classList.remove('field-invalid'));
    const summary = step.querySelector('[data-step-error-summary]');
    if (summary) {
      summary.hidden = true;
      summary.textContent = '';
    }
  };

  const stepErrorSummary = (step) => {
    let summary = step.querySelector('[data-step-error-summary]');
    if (!summary) {
      summary = document.createElement('div');
      summary.className = 'step-error-summary';
      summary.setAttribute('data-step-error-summary', '');
      summary.setAttribute('role', 'alert');
      summary.hidden = true;
      const intro = step.querySelector('p');
      if (intro && intro.nextSibling) {
        intro.parentNode.insertBefore(summary, intro.nextSibling);
      } else {
        step.insertBefore(summary, step.firstChild);
      }
    }
    return summary;
  };

  const validateCurrentStep = () => {
    const step = steps[currentStep];
    clearStepErrors(step);
    const invalidFields = [];

    requiredFieldsForStep(step).forEach((field) => {
      const label = getFieldLabel(field);
      const value = field.type === 'checkbox' ? field.checked : String(field.value || '').trim();
      let message = '';

      if (!value) {
        message = field.type === 'checkbox'
          ? 'Please confirm this before continuing'
          : `${label} is required`;
      } else if (field.type === 'email' && !validateEmail(String(field.value || '').trim())) {
        message = `${label} must be a valid email address`;
      } else if (field.type === 'tel' && !validatePhone(String(field.value || '').trim())) {
        message = `${label} must be a valid UK phone number`;
      }

      if (message) {
        if (field.type === 'checkbox') {
          const consentError = step.querySelector('.consent-error');
          if (consentError) consentError.textContent = message;
          const wrapper = field.closest('.consent-row');
          if (wrapper) wrapper.classList.add('field-invalid');
          field.setAttribute('aria-invalid', 'true');
          invalidFields.push('setup consent');
        } else {
          setError(field, message);
          invalidFields.push(label);
        }
      }
    });

    if (invalidFields.length) {
      const summary = stepErrorSummary(step);
      const uniqueFields = Array.from(new Set(invalidFields));
      summary.textContent = `Complete before continuing: ${uniqueFields.join(', ')}.`;
      summary.hidden = false;
      const firstInvalid = step.querySelector('[aria-invalid="true"]');
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        window.setTimeout(() => firstInvalid.focus({ preventScroll: true }), 220);
      }
      return false;
    }

    return true;
  };

  const renderStep = () => {
    steps.forEach((step, index) => {
      const active = index === currentStep;
      step.hidden = !active;
      step.classList.toggle('is-active', active);
    });

    if (currentStepNode) currentStepNode.textContent = String(currentStep + 1);
    if (progressBar) progressBar.style.width = `${((currentStep + 1) / steps.length) * 100}%`;

    if (backButton) backButton.hidden = currentStep === 0;
    if (nextButton) nextButton.hidden = currentStep === steps.length - 1;
    if (submitButton) submitButton.hidden = currentStep !== steps.length - 1;
  };

  const formDataObject = () => Object.fromEntries(new FormData(onboardingForm).entries());

  const formatOnboardingMessage = (fields) => {
    const sections = [
      ['BUSINESS', ['business_name', 'contact_name', 'contact_email', 'contact_mobile', 'website', 'google_profile']],
      ['TRADE AND AREA', ['trade_category', 'emergency_work', 'service_areas', 'working_hours', 'wanted_jobs', 'blocked_jobs']],
      ['PHONE SETUP', ['main_phone', 'phone_type', 'phone_provider', 'current_missed_behaviour', 'forwarding_mode', 'setup_time']],
      ['LEAD HANDLING', ['lead_alert_email', 'lead_alert_mobile', 'callback_owner', 'callback_target', 'alert_method']],
      ['SMS AND FORM', ['sms_business_name', 'message_tone', 'callback_promise', 'full_address', 'extra_questions']],
      ['BRANDING AND FORM LINK', ['form_link_preference', 'domain_contact', 'logo_link', 'brand_colours']],
      ['FINAL NOTES', ['final_notes']]
    ];

    const label = (key) => key.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

    return sections.map(([title, keys]) => {
      const lines = keys
        .map((key) => [label(key), fields[key]])
        .filter(([, value]) => value !== undefined && String(value).trim() !== '')
        .map(([name, value]) => `${name}: ${String(value).trim()}`);
      return lines.length ? `${title}\n${lines.join('\n')}` : '';
    }).filter(Boolean).join('\n\n');
  };

  onboardingForm.querySelectorAll('input, select, textarea').forEach((field) => {
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true') {
        setError(field, '');
        const step = steps[currentStep];
        const summary = step ? step.querySelector('[data-step-error-summary]') : null;
        if (summary) {
          summary.hidden = true;
          summary.textContent = '';
        }
      }
    });
    field.addEventListener('change', () => {
      if (field.getAttribute('aria-invalid') === 'true') {
        setError(field, '');
        const step = steps[currentStep];
        const summary = step ? step.querySelector('[data-step-error-summary]') : null;
        if (summary) {
          summary.hidden = true;
          summary.textContent = '';
        }
      }
    });
  });

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      if (!validateCurrentStep()) return;
      currentStep = Math.min(currentStep + 1, steps.length - 1);
      renderStep();
      onboardingForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  if (backButton) {
    backButton.addEventListener('click', () => {
      currentStep = Math.max(currentStep - 1, 0);
      renderStep();
      onboardingForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  onboardingForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validateCurrentStep()) return;

    const fields = formDataObject();
    const payload = {
      name: fields.contact_name ? fields.contact_name.trim() : '',
      business_name: fields.business_name ? fields.business_name.trim() : '',
      trade: fields.trade_category ? fields.trade_category.trim() : '',
      phone: fields.contact_mobile ? fields.contact_mobile.trim() : '',
      email: fields.contact_email ? fields.contact_email.trim() : '',
      area: fields.service_areas ? fields.service_areas.trim() : '',
      service_interest: 'Paid client onboarding setup details',
      message: formatOnboardingMessage(fields),
      source_page: window.location.href,
      consent: Boolean(onboardingForm.elements.setup_consent && onboardingForm.elements.setup_consent.checked)
    };

    const fallbackUrl = buildMailtoFallback('BFNG client onboarding details', {
      Business: payload.business_name,
      Name: payload.name,
      Trade: payload.trade,
      Phone: payload.phone,
      Email: payload.email,
      Details: payload.message
    });

    setSubmitState(submitButton, true, 'Submitting...');

    try {
      await postEnquiry(payload);
      onboardingForm.reset();
      currentStep = 0;
      renderStep();
      showSuccess(onboardingForm, 'Onboarding received. BFNG will review your setup details and contact you with the next step.');
    } catch (error) {
      showFormError(onboardingForm, 'The onboarding form could not submit automatically.', fallbackUrl);
    } finally {
      setSubmitState(submitButton, false);
    }
  });

  renderStep();
}
