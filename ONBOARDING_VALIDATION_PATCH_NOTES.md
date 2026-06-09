# BFNG onboarding validation patch

Updated the multi-step onboarding flow so customers are explicitly told which fields are blocking progress.

Changes:
- Required empty fields now show field-specific error messages, e.g. "Business name is required".
- The current step displays a clear summary: "Complete before continuing: ...".
- Invalid fields are visually highlighted with a red border/background.
- The first invalid field is scrolled into view and focused.
- Errors clear when the customer edits the highlighted field.
