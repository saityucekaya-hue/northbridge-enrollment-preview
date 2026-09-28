# Home dashboard preview

Route: `/dashboard`, alongside `/my-enrollment` in this standalone Vite preview.

## Implemented design

- Google Sans Flex, served locally with the OFL license in `public/fonts`.
- Home and My Enrollment render the same `StudentNavigation` component and original enrollment menu styles: 240px desktop sidebar, 260px mobile drawer, identical wordmark, icons, spacing, points card, and hamburger behavior. The active page is the only navigation highlight difference. Home-specific sidebar styles were removed.
- Northbridge navy navigation, green task metadata, and complementary lavender and amber financial accents.
- Campus map hero, compact weekly calendar, Your Enrollment Progress, Your financials, Announcements, and an arrow-controlled News carousel.
- Calendar C uses seven equal day cells with a maximum of two event previews, a total-count badge, and +N more for busy days. Each preview opens event details. The previous duplicated selected-day list is removed.
- The header retains title/date at left, centered Previous / Today / Next controls, and View calendar at right. Phone widths put the navigation controls on a second row.
- Saturday 24 July starts selected with five sample events in chronological order. +3 more opens a native popover listing all five times, titles and locations. Its position clamps to the viewport and flips above the trigger where needed. Escape, outside click and the close button dismiss it; focus returns to the trigger. Opening an event uses the existing detail dialog.
- The card stays compact when the popover opens. Empty dates add no message or event list. PREVIEW-HOME-001 and PREVIEW-HOME-004 cover desktop/mobile behavior and focus restoration.
- One shared `CardAction` component provides matching top-right, green underlined header actions: View enrollment, View financials, View All (Announcements), and View calendar. News retains its carousel and individual article action, with no card-level footer action. The duplicate Enrollment progress header caption was removed after the card title became Your Enrollment Progress.
- Busy-day popovers show only that day's events; empty dates show no message or extra event row. Week navigation handles month boundaries. Today selects the actual local calendar date; the initial sample week is 19–25 July 2027.
- Enrollment links open the corresponding task in My Enrollment. Shared session progress and earned points are recalculated on returning Home.
- Financials replace Campus events. The illustrative total is $60,000 minus $12,000 aid and $5,000 payments, leaving $43,000.
- Mobile uses a dismissible navigation drawer and a horizontally scrolling week. Dialogs support Escape and restore focus.

## Boundaries

This is a standalone design preview using sample content, not a connected student account. Financials, notifications, announcements, news, and campus events are illustrative. Existing task preview persistence stays in the browser tab. No backend, deployment, or production repository changes are included.

## Assets and provenance

- Hero: `public/dashboard/campus-map.png`, generated using the approved `12-home-dashboard-weekly-google-sans-flex.png` concept as reference. Original retained in the Codex generated images directory. UI labels, map markers, controls, and typography are rendered in React, not baked into the image.
- Exact hero prompt: “Create ONLY the standalone wide campus panorama illustration artwork for the top hero from this reference dashboard, no UI, no text, no labels, no pins, no buttons. Wide landscape aspect ratio 3:1. Match the reference's clean polished flat editorial vector-like style, pale powder blue sky, cream collegiate buildings with teal slate roofs, tall central clocktower, paths, layered green trees and muted blue mountains, small warm golden sun. Composition for a website hero: LEFT 42 percent mostly empty pale blue sky with just low trees/hills along bottom for readable dark text to be added later. ALL detailed campus buildings in right 58 percent. Buildings sit along bottom edge. No borders or margins. High quality production web asset.”
- News reuses existing campus and interest artwork from this preview.
- Font source: Google Fonts CSS endpoint for Google Sans Flex at weights 400, 500, 600, 700. The returned font files were downloaded from fonts.gstatic.com; license from `google/fonts/main/ofl/googlesansflex/OFL.txt`. `public/fonts/google-sans-flex.css` retains the source URLs for provenance; the app uses local files.

## Journey verification

`tools/testing/journeys.json` binds PREVIEW-HOME-001 through PREVIEW-HOME-004 to ordered steps in `tools/browser-tests/home.spec.ts`. They cover weekly selection and dates, enrollment handoff and persistence, content/detail interactions, and mobile navigation. Tests use actual rendered controls in Edge; no injected state or API setup.

PREVIEW-HOME-005 compares rendered desktop/mobile navigation geometry and typography across both routes, checks desktop Menu behavior, and verifies mobile dismissal/focus. PREVIEW-ENR-006 also verifies that the shared mobile header keeps points visible after scrolling. The shared wrapper uses `display: contents` so the header retains its original sticky behavior.

PREVIEW-HOME-006 checks all eight navigation items and the compact points card at desktop heights of 825px and 600px and mobile heights of 844px, 640px and 500px. The navigation no longer shrinks into a scroll container. The progress card uses less vertical padding and a 27px point total; short screens also tighten menu spacing. Checks confirm no sidebar/navigation overflow and no overlap between Account and the points card.

PREVIEW-HOME-007 covers the renamed heading, four shared header actions, calendar schedule/event details, announcements, financial details, focus restoration, and the enrollment link on mobile. Screenshots cover the reported 1104×884 viewport and a 390×844 phone.

Visual review: inspected desktop at 1440×1000 and mobile at 390×844 against the approved concept. Intentional differences: Financials replaces Campus events, dates/actions removed as requested, the existing campus photo is reused for News, and mobile stacks modules beneath a scrollable week.

Calendar C verification (2026-09-28): production build passed; PREVIEW-HOME-001, PREVIEW-HOME-004 and PREVIEW-HOME-007 passed in Edge. Desktop busy-week height is approximately 230px at 1104x884. Screenshots reviewed for the collapsed desktop calendar and desktop/mobile popovers. Evidence: ../test-runs/2026-09-28-calendar-c-01 (header action pass), -02 (mobile pass), and -03 (desktop pass). Earlier failed checks were corrected test-locator assumptions and the initial estimated height threshold; final affected journeys passed. Hero concepts A/B/C are image drafts only; future campus destination routing remains deferred.

## Approved campus hero B (2026-09-28)

The dashboard now uses the Through the Arch concept. Production art is public/dashboard/campus-arch-b.png, derived from approved concept exec-c4de744d-fb54-4238-b5de-1c589d1044a2.png with image generation to remove all text, pins and notification UI while preserving the composition. Clean source: exec-0e34d286-fccd-4e85-9dde-892faf9b5dc4.png in the chat generated-images folder. Greeting, bell, four destination markers and hover/focus hints are real React controls. Desktop uses the 3:1 panorama; phones show the artwork above a two-column destination control group. Library, Sports Center, Fraternity House and Student Union open accessible destination previews. Campus & study routing remains deferred as requested.

Validation: production build passed. PREVIEW-HOME-008 covers all four markers at 1440, 1104 and 390px, containment/non-overlap, opening matching dialogs and Escape focus restoration. PREVIEW-HOME-004 confirms mobile navigation and calendar still work. Both passed in Edge, with desktop/mobile screenshots visually reviewed. Evidence: ../test-runs/2026-09-28-hero-b-01.
## GitHub Pages publication

The existing site remains https://saityucekaya-hue.github.io/northbridge-enrollment-preview/.
Direct entry points are dashboard/, my-enrollment/, and my-enrollment-walkthrough/ beneath that base. The root retains the existing onboarding experience.
Vite emits an index.html for each route so GitHub Pages refreshes and direct links work without an SPA fallback. PAGES_BASE rewrites bundled assets to the repository prefix.
PREVIEW-PAGES-001 verifies these routes, reloads, shared navigation, and asset loading. Set PAGES_SITE_URL to a built preview or the published site to run it.
