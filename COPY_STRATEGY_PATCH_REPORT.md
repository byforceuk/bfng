# BFNG Copy Strategy Patch Report

## Current-copy problems found
- Homepage hero was still abstract: “leads”, “make more money”, “one package” rather than paid calls, missed calls and competitor loss.
- System section described features without making the before/after financial leak clear.
- Offer was not explicit enough on the homepage: £1,495, live in 48 hours, and the five deliverables were not stated together.
- Trade pages were serviceable but still used “lead” language and old pricing fragments that conflicted with the current one-package offer.
- Some internal navigation still pointed to old anchors such as `#pricing`, `#enquiry`, `#audit`, and `#proof`.

## Files changed
- `index.html` — 159 lines, SHA256 `5cdcd2c258278ca4a195eb28c2238dfe1adc2884b4195e2709214142b800d405`
- `plumbers.html` — 44 lines, SHA256 `4c99b2f807d3a43b0b97d8014dd6cd166c6afbaf17b3af6c7d24ac4357a7eb96`
- `locksmiths.html` — 44 lines, SHA256 `a8fd9784297f9c11893b303e94c97cb4cefff881a0b3feb919e867b19ad74de9`
- `roofers.html` — 44 lines, SHA256 `ebb242cabec52d32fd9e2a4717770ce97a0d929caf0791e578aaf0e9054fcd31`
- `electricians.html` — 44 lines, SHA256 `fe99ee5efa91a8b169e6ffd83f8c372f0841fa9045ca33547fa83a1bcf843557`
- `drainage.html` — 44 lines, SHA256 `2bec09c144b966fc425d1364edfd41d47b650a39ef2471ebe3f0a1903de42bb0`
- `builders.html` — 44 lines, SHA256 `81b58bb0444d8584d68bd37306959e328ca6b75a73c5701dd41c412e880c0162`
- `onboarding.html` — 196 lines, SHA256 `1f4315d152b6af80ff918451552da113f5874368aa44340c5348ac5d559c625b`
- `onboarding/index.html` — 196 lines, SHA256 `3edad561312aea6cba0edb6e20dd6b98f8f823532d9ea3cbd1953da9fe3ec96c`
- `styles.css` — 1295 lines, SHA256 `ffdd36b9296fd0a2874cc3bcf0030d9251ebb2d0fb4813f7456e47fc408ff098`
- `privacy.html` — 1 lines, SHA256 `33802222d420af3d9cce833b336895e4a1ac8ea530ac8e212fbd8e4d13af23ac`
- `terms.html` — 1 lines, SHA256 `aa92f7f20b7793515f50b17d753178576ddb0cf302418fbf62da2eaef5fdef0d`
- `gdpr.html` — 1 lines, SHA256 `472942982500bf67802f5e7c68df4b14f670a07a3cac711a97c50ca04d64eae2`
- `demo.html` — 51 lines, SHA256 `147b642ec9993e89cc06e8322a60cffa1951628467a14e4e09be3da47f3c63d1`
- `missed-call-text-back-vs-ai-receptionist.html` — 37 lines, SHA256 `e0f829587a144b599a4839a63f87874529e1dc7185afa57e2673e5a609b2c029`
- `missed-job-audit.html` — 46 lines, SHA256 `6a9ad9465667b476442d211324e137aaa79dfd8e1cd4c52e804d0e31548c4160`
- `COPY_STRATEGY_PATCH_REPORT.md` — 24 lines, SHA256 `c4e67b9f654e11a5b5eaeff42cc8ca55e29718630a7e604136dd6e513deba78a`

## Strategic changes made
- Rebuilt the homepage around: “You already paid for that call. Someone else got the job.”
- Standardised CTAs around “See how many calls you’re missing →”.
- Added a clear “Missed Call Revenue Recovery System” offer block: done for you, live in 48 hours, £1,495.
- Added the hiring-angle section before receptionist/admin spend.
- Rewrote system features around missed-call text back, capture page, CRM follow-up, ad call tracking, and 30-day reporting.
- Rewrote plumbers, locksmiths, roofers, electricians, drainage, and builders/landscapers pages with trade-specific competitor-threat language.
- Preserved existing layout classes, CSS/JS filenames, images, favicon, forms, and onboarding destination.

## Quality checks completed
- Homepage states the offer and outcome within the first screen.
- Copy now favours calls, jobs, enquiries, customers and quote requests over “leads”.
- No fake guarantees, testimonials, logos, or unsupported results were added.
- Existing form field names were preserved to avoid breaking JavaScript or backend handling.
- Broken legacy anchor references were redirected to current homepage sections or onboarding.
- Added responsive CSS only for the new offer/hiring blocks.
