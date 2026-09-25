# Offer-led student onboarding: UX and contract notes

## Preview behavior

The flow follows the supplied [two-theme design reference](../../onboarding-design-reference.md): My Offer → Contact & access → optional Campus life → Start enrollment → independent ID and profile-photo selection → Next steps. The fictional offer begins on the offer screen after a sample invitation or demo sign-in. A sample acceptance acknowledgement controls only browser state. No actual offer, account, document, profile, or university task is changed.

The product makes three important distinctions visible:

1. An accepted offer does not reserve a place; the conditional offer still requires a final transcript and remaining enrollment work.
2. A selected local file is not an uploaded or approved document. File bytes are not stored or sent by this preview. Returning after a reload requires selecting the file again.
3. Campus interests are optional and cannot affect offer status.

The reference images show Google, Microsoft, and Apple sign-in choices. The workspace's active student policy is email and password, so the original sample flow does not expose student identity-provider options. The separate `/motion-concept` preview now shows Google, Apple, and Facebook as visual concept controls that advance local state only. They must not be carried into the active student portal without an approved policy and real provider integration. The university switcher is a sample-theme control; a connected portal must use the server-provided institution identity and published theme, not a browser-chosen tenant.

The sample offer now shows tuition, mandatory fees, estimated direct charges, deposit timing, and aid status, and the confirmation repeats the cost estimate. These values are invented for the preview and labeled illustrative. The diploma preview is a future vision, not an issued credential. Its entrance and reveal animation have a reduced-motion equivalent.

## Current platform boundary

The platform owns the following existing endpoints. This frontend intentionally does not call them:

| Job | Current endpoint | Integration concern |
| --- | --- | --- |
| Accept admitted offer | `POST /v1/admission-offers/{offerId}/accept` | Confirm server response before showing accepted state; handle duplicate, expired, withdrawn, and already-accepted offers. |
| Student session and routing | `GET /v1/student/bootstrap` | Read canonical onboarding status, version, and initial route. |
| Credential sign-in | `POST /v1/auth/sign-in` | Currently development-only; production policy and setup are unfinished. |
| Onboarding read/save | `GET/PUT /v1/student/onboarding` | Use `expectedVersion`, `currentStep`, and `data`; handle conflict and resume. |
| Onboarding completion | `POST /v1/student/onboarding/complete` | Completion requires backend eligibility; a local button is not proof. |
| Requirements | `GET /v1/student/requirements` | Drive real remaining tasks and reserved-place status from authoritative data. |
| Documents | `GET /v1/student/documents`, `POST /v1/student/documents/upload` | Multipart upload accepts PDF/JPEG/PNG up to 10 MiB, with backend signature checks; profile photo has its own product requirements and must not be treated as the same document category by assumption. |
| Extraction review | Document confirmation/retry endpoints | Keep pending, review, accepted, and failed states truthful. |

Current onboarding policy is fixed: `offer → about_you → housing → campus_life → emergency_contacts → family_permissions → review_and_sign → deposit`, with campus life and deposit skippable. This preview groups contact, campus discovery, and enrollment entry differently and would require an approved backend workflow change before production connection. The platform has no admitted-student one-time invitation redemption and password creation endpoints yet. Define them with single-use, expiration, account binding, rate limiting, replay handling, and session creation before integrating the preview. Do not map this UI to development self-sign-up.

The canonical `AdmissionOfferSummary` currently carries program, term, campus, response deadline, deposit amount, and status. It does not carry tuition, mandatory fees, aid, conditions, study mode, or a full letter. `StudentFinancials` contains cost-of-attendance and aid data but is a separate later-stage record, not an offer quote. Production use of this design needs an authoritative, versioned offer-detail contract and persistence source for all displayed academic, financial, and policy terms. The UI must never derive a tuition quote from the financials summary or client-side sample data.

## Design decisions

- The full sample offer, condition, deadline, deposit, and illustrative costs are visible before the acceptance action. The decision includes a second explicit review step covering the financial terms.
- Contact and password are requested only after sample acceptance. Passwords allow paste, require 12 characters, and are never persisted in the preview.
- ID and profile photo are separate controls with their own format rules and error messages. Camera controls invoke the device file/camera chooser when supported; they do not claim to have uploaded a file.
- The five-stage progress indicator reflects the offer-led journey. A stage can be revisited without silently unlocking later steps. Reduced-motion settings remove image hover transitions.
- The thank-you state refers to remaining tasks and never claims the student's place is reserved.

These choices align with [GOV.UK account creation](https://design-system.service.gov.uk/patterns/create-accounts/), [file upload](https://design-system.service.gov.uk/components/file-upload/), [check answers](https://design-system.service.gov.uk/patterns/check-answers/), and [OWASP single-use token guidance](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html). The reference is a product hypothesis until tested with admitted students and institutions.
