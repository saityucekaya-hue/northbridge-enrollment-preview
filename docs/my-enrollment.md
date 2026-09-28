# My Enrollment preview

Implemented in the Northbridge design preview, following the approved sunny mountain design. The existing onboarding completion action now opens this screen. Direct local route: `/my-enrollment`. Static-host-compatible route: `/#my-enrollment` (prefixed by the configured Vite base on GitHub Pages).

## Behavior

- Fixed dark navigation, responsive drawer, no duplicate profile header.
- ToDo, In Review and Done stack vertically with explicit item counts and independent collapse toggles. All sections start expanded. Status accents are green, amber and purple respectively.
- Each status heading sits directly above its individual task cards without an outer frame. No numbered status markers or row deadlines. Only explicitly flagged ToDo tasks carry a pastel-red Action needed label. Review and Done cards do not repeat their section status.
- Each card has a task-type outline icon, description, minutes, outlined points icon and `+100 pts`. Task actions use sage buttons; all view actions share an outlined treatment.
- Readability revision: Google Sans Flex task headings are 16px/750, descriptions 14px/500, task metadata and action buttons 13px, and status headings 22px/750. Calendar dates use 14–15px type. Narrow layouts wrap controls and stack task actions instead of shrinking text. Watercolor eucalyptus replaces the outline leaf decorations.
- Search and advanced Filters are removed. The quick filters select Action needed, In review or Done; All tasks clears the filter. The section titles remain ToDo, In Review and Done. Sorting works within the vertical status groups; prerequisites remain last. Fastest uses estimated minutes, Due Soon uses deadlines. Smart demonstrates deadline/dependency ordering, **not a live AI call**.
- Monthly calendar is independent of task filtering. It contains deadlines, month navigation and selectable dates. Deadline rows highlight on hover and keyboard focus and open the matching task preview dialog; empty dates have no action. The sample-data page footer is removed.
- A confirmed housing/access preference completes one sample task, adds its points and moves the hiker to the next checkpoint. The hiker changes facing direction on alternating route segments. Reduced motion places it immediately.
- A transcript selection moves to In Review after sample submission. It does not complete the task or unlock the deposit. Prerequisite/detail views never award points.
- Sample statuses survive refresh in session storage. No document bytes or filenames are stored; no files/preferences are uploaded. Closing the browser tab clears this tab-scoped preview state.
- Keyboard focus is contained in native dialogs and restored on close. Navigation traps focus only while the mobile drawer is open. The calendar rail sticks only when viewport height can accommodate it.

## Validation

`npm test` runs existing onboarding regression tests and the new `src/MyEnrollment.test.tsx` suite. `npm run build` also checks TypeScript. `npm run test:browser` runs repeatable UI journeys against the running preview at port 32902 (override with `ENROLLMENT_PREVIEW_URL`). It uses installed Edge by default and saves traces/video/screenshots to `ENROLLMENT_EVIDENCE_DIR` or ignored `test-results/`.

Journey bindings are in `tools/testing/journeys.json`. These are **preview-only** journeys. The canonical portal registry was consulted but is not edited by this isolated concept. No authentication, backend persistence, document approval, actual FERPA grants, payments, or real AI ranking is verified here. Navigation destinations outside enrollment/documents/help are sample panels.

## Review workflow

Branch: `codex/my-enrollment-mountain`. Local worktree: `northbridge-my-enrollment`. Keep the original preview checkout unchanged. User approval is required before pushing/merging. The existing repository publishes GitHub Pages when main is pushed; no remote changes or deployment have been performed for this work.

- Navigation revision: desktop sidebar is 240px wide, mobile drawer 260px. Points sit below Account outside the independently scrollable menu. The mobile header retains a compact points total when the drawer is closed; earned points update after a completion. Short viewports hide only the decorative sidebar footer.

- A compact Sort dropdown sits beside the quick filters when the task column is wide enough, wrapping into its own right-aligned row above the section heading on narrower screens. It offers Smart, Due Soon and Fastest without changing the active status filter. The Your tasks / All tasks header row is removed. Status headings retain dark ink. Smart has a continuously flowing pastel rainbow treatment and a white sparkle; reduced motion keeps the spectrum static.

- Individual task cards sit below their vertical status headings, without outer group frames. The Sort dropdown has a subtle flowing rainbow border while Smart is selected, static under reduced motion.


- Home and Enrollment share locally hosted Google Sans Flex (400/500/600/700), including task dialogs. The existing Enrollment serif wordmark and illustration caption are preserved.

- Hero copy explains documents, access preferences, housing, calendar deadlines, status tracking and completion points in two sentences.

- Action needed is an independent `actionNeeded` task flag, not every ToDo. Only the transcript is flagged in this sample; FERPA, housing and the prerequisite-dependent deposit remain unflagged. In review and Done quick filters still select their status groups. Review/completed/prerequisite-dependent tasks never display the attention flag.

- Sorting uses an icon-led menu: Smart (sparkles), Due Soon (alarm), and Fastest (rocket). The chosen icon appears in the trigger. Arrow keys, Home/End, Enter and Escape are supported, with focus restored after selection. The control is separated from the collapse arrow and has breathing room above the first card.

- The trigger retains the visible Sort: prefix before the selected icon and label, with vertical up/down sorting arrows on the right.

## Optional walkthrough route

Open `/my-enrollment-walkthrough` (or `/#my-enrollment-walkthrough` on static hosting) to automatically start an eight-step spotlight tour. It covers progress, tasks, quick filters, sorting, In Review, Done, deadlines and help. The normal `/my-enrollment` route does not show the tour. Back/Next guide the student; Finish, Skip, Close and Escape open the normal page. Reopening or refreshing the walkthrough starts at step one. No task or progress data is changed by the tour. The native modal keeps background controls inactive, focuses each new step heading, adapts to screen size, and respects reduced motion.

Reference: https://pub.dev/packages/flutter_tutorial_overlay. Implemented with React and browser APIs in this web preview; no Flutter dependency. Journeys PREVIEW-ENR-008 and PREVIEW-ENR-009 cover progression, viewport placement, keyboard focus, exits, restart and unchanged task data.

- Walkthrough transitions use a distance-aware 600–950ms eased scroll, synchronized spotlight and tooltip movement, and a gentle text entrance. Back/Next wait for arrival to prevent overlapping transitions; Skip, Close and Escape stay available. Reduced motion moves directly with no text animation. PREVIEW-ENR-010 checks intermediate rendered frames and interruption during movement.
