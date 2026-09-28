import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

async function selectSort(page: Page, label: string) {
  await page.getByRole('button', { name: /^Sort tasks:/ }).click();
  await page.getByRole('menuitemradio', { name: label, exact: true }).click();
}

// Only public preview UI actions. No injected storage, API writes or route mocks.
async function evidence(page: Page, info: TestInfo, name: string, target?: Locator) {
  if (target) await target.scrollIntoViewIfNeeded();
  await page.screenshot({ path: info.outputPath(`${name}.png`), fullPage: !target });
  if (target) {
    const box = await target.boundingBox();
    // The SVG is a separate annotation layer; the unmodified screenshot is retained.
    if (box) await writeFile(info.outputPath(`${name}-target.svg`), `<svg xmlns="http://www.w3.org/2000/svg" width="${page.viewportSize()?.width}" height="${page.viewportSize()?.height}"><rect x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" fill="none" stroke="red" stroke-width="3"/></svg>`);
  }
}

const browserEvidence = new WeakMap<Page, { errors: string[]; requests: { url: string; status: number }[] }>();
async function expectVerticalStatuses(page: Page) {
  const regions = [];
  for (const name of ['ToDo tasks', 'In Review tasks', 'Done tasks']) {
    const region = page.getByRole('region', { name });
    await expect(region.getByRole('heading', { level: 2 })).toBeVisible();
    regions.push(await region.boundingBox());
  }
  expect(regions[0]!.y + regions[0]!.height).toBeLessThan(regions[1]!.y);
  expect(regions[1]!.y + regions[1]!.height).toBeLessThan(regions[2]!.y);
  await expect(page.getByRole('group', { name: 'Filter by status' })).toBeVisible();
}
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  const requests: { url: string; status: number }[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) requests.push({ url: response.url().split('?')[0], status: response.status() }); });
  browserEvidence.set(page, { errors, requests });
});

test.afterEach(async ({ page }, info) => {
  const logs = browserEvidence.get(page);
  await writeFile(info.outputPath('browser-errors.json'), JSON.stringify(logs, null, 2));
  expect(logs?.errors).toEqual([]);
  expect(logs?.requests).toEqual([]);
});

test('PREVIEW-ENR-001 — vertical status sections toggle independently and sort within groups', async ({ page }, info) => {
  await page.goto('/my-enrollment');
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);
  const todoSort = page.getByRole('button', { name: /^Sort tasks:/ });
  await expect(todoSort).toBeVisible();
  await expect(todoSort).toHaveAccessibleName('Sort tasks: Smart');
  await expect(todoSort).toHaveText('Sort:Smart');
  await expect(todoSort.locator('svg.lucide-arrow-down-up')).toBeVisible();
  await expect(todoSort.locator('svg.lucide-chevron-down')).toHaveCount(0);
  await expectVerticalStatuses(page);
  await expect(page.getByRole('article')).toHaveCount(8);
  await expect(page.locator('.en-sort-picker')).toHaveCSS('animation-name', 'en-spectrum-edge');
  await todoSort.click();
  for (const [label, icon] of [['Smart', 'sparkles'], ['Due Soon', 'alarm-clock'], ['Fastest', 'rocket']]) {
    await expect(page.getByRole('menuitemradio', { name: label, exact: true }).locator(`svg.lucide-${icon}`)).toBeVisible();
  }
  await evidence(page, info, '00-sort-menu', page.getByRole('menu', { name: 'Sort tasks' }));
  await page.keyboard.press('Escape');
  await expect(todoSort).toBeFocused();
  await todoSort.press('ArrowDown');
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await expect(todoSort).toHaveAccessibleName('Sort tasks: Fastest');
  await selectSort(page, 'Smart');
  const pickerBox = await page.locator('.en-sort-picker').boundingBox();
  const filterBox = await page.getByRole('group', { name: 'Filter by status' }).boundingBox();
  expect(Math.abs(pickerBox!.y - filterBox!.y)).toBeLessThan(5);
  expect(pickerBox!.x - (filterBox!.x + filterBox!.width)).toBeGreaterThanOrEqual(24);
  const cardBox = await page.getByRole('article').first().boundingBox();
  expect(cardBox!.y - (pickerBox!.y + pickerBox!.height)).toBeGreaterThanOrEqual(16);
  await evidence(page, info, '01-vertical-desktop');
  await page.getByRole('button', { name: 'ToDo 4 items' }).click();
  await expect(page.getByRole('article', { name: 'Final transcript' })).toBeHidden();
  await expect(page.getByRole('article', { name: 'Photo ID' })).toBeVisible();
  await expect(page.getByRole('article', { name: 'Complete profile' })).toBeVisible();
  await page.getByRole('button', { name: 'ToDo 4 items' }).click();
  await selectSort(page, 'Fastest');
  await expect(page.getByRole('region', { name: 'ToDo tasks' }).getByRole('article').first()).toHaveAccessibleName('FERPA access');
  await expect(page.getByRole('region', { name: 'Done tasks' }).locator('.en-task-status')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Filters', exact: true })).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: 'Search enrollment tasks' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Done 3 items' }).click();
  await expect(page.getByRole('article', { name: 'Complete profile' })).toBeHidden();
  await page.getByRole('button', { name: 'Done 3 items' }).click();
  await expect(page.getByRole('article', { name: 'Complete profile' })).toBeVisible();
  await evidence(page, info, '02-done-purple', page.getByRole('region', { name: 'Done tasks' }));
  await page.setViewportSize({ width: 1048, height: 884 });
  await page.reload();
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);
  await evidence(page, info, '03-compact-heading', todoSort);
  const heading = await page.getByRole('button', { name: 'ToDo 4 items' }).boundingBox();
  const sorts = await todoSort.boundingBox();
  const compactFilters = await page.getByRole('group', { name: 'Filter by status' }).boundingBox();
  expect(sorts!.y - (compactFilters!.y + compactFilters!.height)).toBeGreaterThanOrEqual(15);
  expect(heading!.y - (sorts!.y + sorts!.height)).toBeGreaterThanOrEqual(23);
  await selectSort(page, 'Due Soon');
  await expect(page.getByRole('button', { name: 'ToDo 4 items' })).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('region', { name: 'ToDo tasks' }).getByRole('article').first()).toHaveAccessibleName('Final transcript');
});

test('PREVIEW-ENR-007 — quick filters match task labels and preserve section names', async ({ page }, info) => {
  await page.goto('/my-enrollment');
  const filters = page.getByRole('group', { name: 'Filter by status' });
  for (const [label, heading, count] of [['Action needed', 'ToDo', 1], ['In review', 'In Review', 1], ['Done', 'Done', 3]] as const) {
    await filters.getByRole('button', { name: label, exact: true }).click();
    await expect(page.getByRole('article')).toHaveCount(count);
    await expect(page.getByRole('heading', { name: `${heading} ${count} ${count === 1 ? 'item' : 'items'}` })).toBeVisible();
    if (label === 'Action needed') {
      await expect(page.locator('.en-task-status')).toHaveText(['Action needed']);
      await expect(page.locator('.en-task-status .en-status-label')).toHaveCSS('background-color', 'rgb(251, 233, 231)');
    } else await expect(page.locator('.en-task-status')).toHaveCount(0);
    await selectSort(page, 'Fastest');
    await expect(page.getByRole('article')).toHaveCount(count);
    await evidence(page, info, `filter-${heading.replaceAll(' ', '-')}`, filters);
  }
  await filters.getByRole('button', { name: 'All tasks' }).click();
  await expect(page.getByRole('article')).toHaveCount(8);
  await expect(page.getByRole('heading', { name: 'ToDo 4 items' })).toBeVisible();
  await expect(page.locator('.en-task-status')).toHaveCount(1);
  await page.setViewportSize({ width: 390, height: 844 });
  await filters.getByRole('button', { name: 'Action needed' }).click();
  await expect(page.getByRole('article')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'ToDo 1 item' })).toBeVisible();
  await evidence(page, info, '04-mobile-action-needed', page.getByRole('article').first());
  await page.getByRole('button', { name: 'Upload transcript' }).click();
  await page.getByLabel('Choose transcript').setInputFiles({ name: 'synthetic-transcript.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 synthetic preview fixture') });
  await page.getByRole('button', { name: 'Submit for review' }).click();
  await expect(page.getByRole('article')).toHaveCount(0);
  await expect(page.getByText('No tasks with this label. Select All tasks to see your enrollment steps.')).toBeVisible();
  await filters.getByRole('button', { name: 'In review', exact: true }).click();
  await expect(page.getByRole('article', { name: 'Final transcript' })).toBeVisible();
  await expect(page.locator('.en-task-status')).toHaveCount(0);
  await page.reload();
  await filters.getByRole('button', { name: 'Action needed' }).click();
  await expect(page.getByRole('article')).toHaveCount(0);
  await filters.getByRole('button', { name: 'All tasks' }).click();
  await expect(page.getByRole('article')).toHaveCount(8);
});

test('PREVIEW-ENR-002 — saving a preference advances the hiker once and survives refresh', async ({ page }, info) => {
  await page.goto('/my-enrollment');
  const hiker = page.locator('.en-hiker').locator('..');
  const start = await hiker.getAttribute('transform');
  await evidence(page, info, '01-housing-action', page.getByRole('button', { name: 'Choose housing' }));
  await page.getByRole('button', { name: 'Choose housing' }).click();
  await page.getByRole('button', { name: 'Save preference' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await page.getByRole('radio', { name: 'On campus', exact: true }).check();
  await evidence(page, info, '02-confirm-preference', page.getByRole('button', { name: 'Save preference' }));
  await page.getByRole('button', { name: 'Save preference' }).click();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '4');
  await expect(page.getByRole('status')).toContainText('+100 pts');
  await expect(page.getByRole('region', { name: 'Points earned' })).toContainText('400 pts earned');
  await expect(page.locator('.en-hiker')).not.toHaveClass(/is-walking/);
  expect(await hiker.getAttribute('transform')).not.toBe(start);
  await expect(hiker).toHaveAttribute('transform', 'translate(615 171)');
  await page.reload();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '4');
  await page.getByRole('article', { name: 'Housing preference' }).getByRole('button', { name: 'View details' }).click();
  await expect(page.getByRole('dialog')).toContainText('This step is complete');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '4');
  await evidence(page, info, '03-four-complete', page.getByRole('progressbar'));
});

test('PREVIEW-ENR-003 — uploads await review and prerequisite views never grant points', async ({ page }, info) => {
  await page.goto('/my-enrollment');
  await page.getByRole('button', { name: 'View prerequisite' }).click();
  await expect(page.getByRole('dialog')).toContainText('transcript needs to be approved');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Upload transcript' }).click();
  await page.getByLabel(/Choose transcript/).setInputFiles({ name: 'synthetic-transcript.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\nSynthetic UI fixture. Not a student document.\n%%EOF') });
  await page.getByRole('button', { name: 'Submit for review' }).click();
  await expect(page.getByRole('button', { name: 'In Review 2 items' })).toBeVisible();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3');
  await expect(page.getByRole('article', { name: 'Final transcript' }).getByRole('button', { name: 'View submission' })).toBeVisible();
  await evidence(page, info, '01-submitted-review', page.getByRole('article', { name: 'Final transcript' }));
});

test('PREVIEW-ENR-004 — phone navigation, calendar and keyboard dialogs remain usable', async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/my-enrollment');
  await expectVerticalStatuses(page);
  await page.screenshot({ path: info.outputPath('00-mobile-first-viewport.png') });
  await expect(page.getByRole('button', { name: 'ToDo 4 items', expanded: true })).toBeVisible();
  await page.getByRole('button', { name: /^Sort tasks:/ }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: info.outputPath('03-mobile-selected.png'), animations: 'disabled' });
  await evidence(page, info, '01-mobile');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('button', { name: 'Account', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open navigation' })).toBeFocused();
  await expect(page.getByText('Northbridge design preview · Sample data')).toHaveCount(0);
  const deadline = page.getByRole('button', { name: '15 Jul Final transcript' });
  await deadline.hover();
  await expect(deadline).toHaveCSS('background-color', 'rgb(237, 245, 241)');
  await evidence(page, info, '04-deadline-hover', deadline);
  await deadline.click();
  await expect(page.getByRole('dialog', { name: 'Final transcript' })).toBeVisible();
  await evidence(page, info, '05-deadline-task', page.getByRole('dialog'));
  await page.keyboard.press('Escape');
  await expect(deadline).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(deadline).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Final transcript' })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Next month' }).click();
  await expect(page.getByText('No enrollment deadlines.')).toBeVisible();
  await page.getByRole('button', { name: 'August 2027 5, Enrollment deposit' }).click();
  await expect(page.getByRole('region', { name: 'Enrollment calendar' })).toContainText('Enrollment deposit');
  await page.getByRole('button', { name: '5 Aug Enrollment deposit' }).click();
  await expect(page.getByRole('dialog', { name: 'Enrollment deposit' })).toContainText('Your final transcript needs to be approved');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'View help center' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'View help center' })).toBeFocused();
  await evidence(page, info, '02-calendar', page.getByRole('region', { name: 'Enrollment calendar' }));
  for (const width of [360, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/my-enrollment');
    await expectVerticalStatuses(page);
    const content = await page.locator('.en-main').boundingBox();
    expect(content && content.x + content.width).toBeLessThanOrEqual(width);
    await expect(page.getByRole('button', { name: 'Choose housing' })).toBeVisible();
  }
});

test('PREVIEW-ENR-005 — reduced motion still updates progress immediately', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/my-enrollment');
  await expect(page.locator('.en-sort-picker')).toHaveCSS('animation-name', 'none');
  await page.getByRole('button', { name: 'Manage access' }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Save preference' }).click();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '4');
  await expect(page.locator('.en-hiker')).not.toHaveClass(/is-walking/);
  await expect(page.locator('.en-hiker').locator('..')).toHaveAttribute('transform', 'translate(615 171)');
  await evidence(page, info, '01-reduced-motion', page.getByRole('progressbar'));
});

test('PREVIEW-ENR-006 — points stay visible in wider navigation and on phones', async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/my-enrollment');
  const sidebar = page.getByRole('complementary', { name: 'Main navigation' });
  const points = sidebar.getByRole('region', { name: 'Points earned' });
  await expect(sidebar).toHaveCSS('width', '240px');
  await expect(points).toContainText('300 pts earned');
  await expect(points).toBeInViewport({ ratio: 1 });
  await page.screenshot({ animations: 'disabled', path: info.outputPath('01-desktop-points.png') });
  await page.getByRole('button', { name: 'View help center' }).scrollIntoViewIfNeeded();
  await expect(points).toBeInViewport({ ratio: 1 });
  await evidence(page, info, '02-scrolled-points', points);
  await page.setViewportSize({ width: 1024, height: 600 });
  await expect(points).toBeInViewport({ ratio: 1 });
  await expect(sidebar.getByRole('button', { name: 'Menu', exact: true })).toBeInViewport();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/my-enrollment');
  const mobilePoints = page.getByRole('region', { name: 'Mobile points earned' });
  await expect(mobilePoints).toHaveText('300 pts');
  await page.getByRole('button', { name: 'View help center' }).scrollIntoViewIfNeeded();
  await expect(mobilePoints).toBeInViewport({ ratio: 1 });
  await page.screenshot({ path: info.outputPath('03-mobile-persistent-points.png') });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(points).toBeInViewport({ ratio: 1 });
  await expect(sidebar).toHaveCSS('width', '260px');
  await page.screenshot({ path: info.outputPath('04-mobile-sidebar.png') });
});
