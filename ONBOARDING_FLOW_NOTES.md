# BFNG onboarding flow patch

Added a deployable multi-stage client onboarding flow for paid clients.

Public paths included:

- `/onboarding.html`
- `/onboarding/index.html` for hosts that support `/onboarding/`

Recommended customer link: `https://bfng.co.uk/onboarding` if your host resolves clean URLs, otherwise use `https://bfng.co.uk/onboarding.html`.

The form posts to the existing BFNG enquiry backend endpoints in `script.js`, using `service_interest = "Paid client onboarding setup details"`. It sends the collected setup data in the `message` field so it works with the current backend without adding a new route.

No telecom passwords are requested. The flow collects only the details needed to prepare SMS wording, job capture forms, call-forwarding walkthrough, lead alerts and setup testing.
