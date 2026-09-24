# Audentra admitted-student frontend preview

A standalone React frontend implementing the [offer-led onboarding design reference](../onboarding-design-reference.md) for two fictional sample institutions: Northbridge University and Audentra University. Jordan Lee, all offer details, and the institution imagery are sample content. The approved Audentra company logo remains unchanged in the powered-by footer.

## Run

Use Node 22 or newer:

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open `http://127.0.0.1:32900/sign-in`. The only supported mode is `TEST_MODE=true`; the frontend makes no backend requests. Set `TEST_MODE=false` to hide the preview until a real backend adapter is implemented.

For the responsive enrollment sequence, open `http://127.0.0.1:32900/motion-concept`. Start from the welcome screen, review or decline the sample offer and full letter, preview access setup, then create a live front/back ID card. A simulated document check unlocks a shareable celebration with two next destinations. The [journey notes](docs/motion-journey-concept.md) describe the college content and backend contracts needed for launch.

## GitHub Pages preview

The GitHub Pages workflow publishes the Northbridge journey at the project site's root. It expects a repository named `northbridge-enrollment-preview`; the build uses `PAGES_BASE=/northbridge-enrollment-preview/` so images, fonts, and the sample offer PDF resolve under that path. The site is a public, static design preview. Offer acceptance, sign-in options, and document checks are simulations; no application, account, or ID image is sent to a university. Choose only sample files when demonstrating the ID screen.

To check the project-site build locally, set `PAGES_BASE=/northbridge-enrollment-preview/`, run `npm run build`, then run `npm run preview` with the same setting and open the URL printed by Vite.

## Try the journey

1. Choose Northbridge or Audentra University with **Sample university**, then click **Explore as Jordan**. The one-time invitation is also previewable from sign-in.
2. Read the conditional offer, including the response deadline, condition, illustrative tuition and fees, deposit, and aid status. Open the full sample letter. The campus side of the page includes an animated, clearly fictional diploma preview and a quotation. **Accept sample offer** requires an explicit review acknowledgement covering the academic and financial terms; it changes local preview state only.
3. Confirm the sample email, enter a phone number, and create a 12-character password. The password is checked and discarded locally. No account is created.
4. Choose campus interests or skip. Neither choice affects the offer.
5. Start enrollment or return later. If started, choose a government ID file and a profile photo independently, using camera or file controls. Selected files remain on the device; they are not uploaded. On reload, file names remain but their contents must be chosen again.
6. See next steps, remaining tasks, and the campus discovery preview. The UI never says the student's place is reserved.

The sample sign-in credentials are `jordan.lee@example.com` / `Welcome2027!`. They are fixtures, not real service credentials. Progress stays in the current browser tab. **Help → Restart sample** clears it.

## Design and integration

- The eight supplied [desktop and mobile reference images](../onboarding-design-reference.md) define the visual direction. Layout, text, buttons, menus, file inputs, validation, and progress are native responsive UI rather than image backgrounds.
- Campus and interest photography was generated as standalone project assets. The Audentra company logo is copied byte-for-byte from the [v2 brand guide](../Audentra-portals-rewrite/docs/v2/brand-identity-guide.md).
- The diploma is native text and CSS, marked as an illustrative future vision rather than an issued credential. The welcome letter rises from its envelope; sample acceptance opens a confetti and college life sequence. Eight original animated SVG scenes show students doing the named activities in the Northbridge palette. Motion is disabled or shortened by the operating system's reduced-motion setting.
- [Contract and UX notes](docs/contract-and-ux.md) distinguish this demo from the current backend's offer and onboarding endpoints and list the contract work needed to connect the flow.
- This project is intentionally separate from the active portal and backend repositories.

## Checks

```powershell
npm test
npm run typecheck
npm run build
```
