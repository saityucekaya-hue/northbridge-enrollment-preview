import { test, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

const errors = new WeakMap<object, string[]>();
test.beforeEach(async ({ page }) => {
  const items: string[] = []; errors.set(page, items);
  page.on('pageerror', error => items.push(error.message));
  page.on('response', response => { if (response.status() >= 400) items.push(`${response.status()} ${response.url().split('?')[0]}`); });
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'Welcome back, Jordan' })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
});
test.afterEach(async ({ page }, info) => {
  await writeFile(info.outputPath('browser-errors.json'), JSON.stringify(errors.get(page)));
  expect(errors.get(page)).toEqual([]);
});

test('PREVIEW-HOME-001 — weekly selection, navigation and simplified labels', async ({ page }, info) => {
  await page.setViewportSize({ width: 1104, height: 884 });
  await expect(page).toHaveTitle('Home · Northbridge University');
  await expect(page.getByRole('button', { name: /Open calendar/i })).toHaveCount(0);
  const days = page.getByRole('group', { name: 'Choose a day' });
  await expect(days).not.toContainText('Jul');
  await expect(page.locator('.hd-selected-events')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Your financials' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Campus events' })).toHaveCount(0);
  const weekHeader = page.locator('.hd-week .hd-card-header');
  const title = await page.getByRole('heading', { name: 'This week', exact: true }).boundingBox();
  const range = await page.locator('.hd-date-range').boundingBox();
  expect(range!.y).toBeGreaterThanOrEqual(title!.y + title!.height);
  const controls = await page.getByRole('group', { name: 'Week navigation', exact: true }).boundingBox();
  const header = await weekHeader.boundingBox();
  expect(Math.abs(controls!.x + controls!.width / 2 - header!.x - header!.width / 2)).toBeLessThan(2);
  const week = page.getByRole('region', { name: 'This week', exact: true });
  const saturday = page.getByRole('button', { name: 'Saturday, 24 July 2027', exact: true });
  const cell = page.locator('.hd-day').filter({ has: saturday });
  await expect(cell.locator('.hd-event-preview')).toHaveCount(2);
  await expect(cell.locator('.hd-event-count')).toHaveText('5');
  const more = cell.getByRole('button', { name: /Show all 5 events/ });
  await expect(more).toHaveText('+3 more');
  const compactHeight = (await week.boundingBox())!.height;
  expect(compactHeight).toBeLessThanOrEqual(240);
  await page.screenshot({ path: info.outputPath('01-desktop-dashboard.png'), fullPage: true });
  await more.click();
  const popover = page.getByRole('dialog', { name: 'Saturday 24 July', exact: true });
  await expect(popover.locator('.hd-popover-event')).toHaveCount(5);
  await expect(popover.locator('time')).toHaveText(['9:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '6:00 PM']);
  expect((await week.boundingBox())!.height).toBe(compactHeight);
  const box = (await popover.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(12);
  expect(box.x + box.width).toBeLessThanOrEqual(1092);
  expect(box.y + box.height).toBeLessThanOrEqual(872);
  await page.screenshot({ path: info.outputPath('02-busy-day-popover.png') });
  await page.keyboard.press('Escape');
  await expect(popover).toHaveCount(0);
  await expect(more).toBeFocused();
  await more.click();
  await page.getByRole('heading', { name: 'Welcome back, Jordan' }).click();
  await expect(popover).toHaveCount(0);
  await more.click();
  await popover.getByRole('button', { name: /Meet your student community/ }).click();
  await expect(page.getByRole('dialog')).toContainText('Student Union');
  await page.keyboard.press('Escape');
  await expect(more).toBeFocused();
  await cell.getByRole('button', { name: /Discover your library/ }).click();
  await expect(page.getByRole('dialog')).toContainText('University Library');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Wednesday, 21 July 2027', exact: true }).click();
  await expect(page.locator('.hd-selected-events')).toHaveCount(0);
  await expect(page.getByText('No events scheduled for this day.', { exact: false })).toHaveCount(0);
  await week.screenshot({ path: info.outputPath('03-empty-day-without-message.png') });
  await page.getByRole('button', { name: 'Next week' }).click();
  await expect(page.locator('.hd-date-range')).toHaveText('26 Jul – 1 August 2027');
  expect((await week.boundingBox())!.height).toBeLessThanOrEqual(240);
  await page.getByRole('button', { name: 'Previous week' }).click();
  await expect(page.locator('.hd-date-range')).toHaveText('19 – 25 July 2027');
  await page.getByRole('button', { name: 'Today', exact: true }).click();
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  await expect(page.getByRole('button', { name: today })).toHaveAttribute('aria-pressed', 'true');
});

test('PREVIEW-HOME-002 — enrollment handoff updates Home progress and points', async ({ page }, info) => {
  await page.getByRole('link', { name: /Housing preference/ }).click();
  await expect(page.getByRole('dialog')).toContainText('Housing preference');
  await page.getByRole('radio', { name: 'On campus', exact: true }).check();
  await page.getByRole('button', { name: 'Save preference' }).click();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '4');
  await page.getByRole('button', { name: 'Home', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('progressbar', { name: 'Enrollment progress' })).toHaveAttribute('value', '4');
  await expect(page.getByRole('region', { name: 'Points earned' })).toContainText('400');
  await expect(page.getByRole('link', { name: /Housing preference/ })).toHaveCount(0);
  await page.reload();
  await expect(page.locator('.hd-progress')).toContainText('50%');
  await page.screenshot({ path: info.outputPath('01-home-updated-progress.png'), fullPage: true });
});

test('PREVIEW-HOME-003 — news, announcements and financial details', async ({ page }, info) => {
  await page.getByRole('button', { name: 'Next news' }).click();
  await expect(page.getByRole('heading', { name: 'Find your people on campus' })).toBeVisible();
  await page.getByRole('button', { name: 'Previous news' }).click();
  await page.getByRole('button', { name: 'Read Your first week, made easy' }).click();
  await expect(page.getByRole('dialog')).toContainText('welcome team');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /Welcome week schedule is live/ }).click();
  await expect(page.getByRole('dialog')).toContainText('20 July');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'View financials', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('$43,000');
  await expect(page.getByRole('dialog')).toContainText('illustrative estimate');
  await page.screenshot({ path: info.outputPath('01-financial-details.png') });
});

test('PREVIEW-HOME-004 — mobile navigation and calendar remain usable', async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('heading', { name: 'Welcome back, Jordan' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await page.screenshot({ path: info.outputPath('01-mobile-dashboard.png'), fullPage: true });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('navigation').getByRole('button', { name: 'My Enrollment', exact: true })).toBeVisible();
  await page.screenshot({ path: info.outputPath('02-mobile-navigation.png') });
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open navigation' })).toBeFocused();
  const more = page.getByRole('button', { name: /Show all 5 events/ });
  await more.click();
  const popover = page.getByRole('dialog', { name: 'Saturday 24 July', exact: true });
  await expect(popover.locator('.hd-popover-event')).toHaveCount(5);
  const box = (await popover.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(12);
  expect(box.x + box.width).toBeLessThanOrEqual(378);
  expect(box.y).toBeGreaterThanOrEqual(12);
  expect(box.y + box.height).toBeLessThanOrEqual(832);
  await page.screenshot({ path: info.outputPath('03-mobile-popover.png') });
  await popover.getByRole('button', { name: /Meet your student community/ }).click();
  await expect(page.getByRole('dialog')).toContainText('Student Union');
  await page.keyboard.press('Escape');
  await expect(more).toBeFocused();
  await page.screenshot({ path: info.outputPath('03-mobile-event.png') });
});

test('PREVIEW-HOME-005 — Home shares the My Enrollment desktop and mobile menu', async ({ page }, info) => {
  const navigation = page.getByRole('complementary', { name: 'Main navigation' });
  async function appearance() {
    await page.evaluate(() => document.fonts.ready);
    return navigation.evaluate(sidebar => {
      const selectors = ['', '.en-menu-button', '.en-wordmark', 'nav button:nth-child(3)', '.en-sidebar-points', '.en-sidebar-points strong', '.en-sidebar-points p', '.en-sidebar-footer'];
      return selectors.map(selector => {
        const element = selector ? sidebar.querySelector(selector)! : sidebar;
        const style = getComputedStyle(element), box = element.getBoundingClientRect();
        return { selector, x: box.x, y: box.y, width: box.width, height: box.height, font: style.font, color: style.color, padding: style.padding, margin: style.margin, gap: style.gap };
      });
    });
  }
  await page.getByRole('navigation').getByRole('button', { name: 'My Enrollment', exact: true }).click();
  await expect(page).toHaveURL(/\/my-enrollment$/);
  const enrollmentDesktop = await appearance();
  await navigation.screenshot({ path: info.outputPath('01-enrollment-menu-desktop.png') });
  await navigation.getByRole('button', { name: 'Home', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  expect(await appearance()).toEqual(enrollmentDesktop);
  await navigation.screenshot({ path: info.outputPath('02-home-menu-desktop.png') });
  await navigation.getByRole('button', { name: 'Menu', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Navigation', exact: true })).toBeVisible();
  await expect(navigation).toHaveCSS('width', '240px');
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(navigation).toHaveCSS('width', '260px');
  await expect(navigation).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  const homeMobile = await appearance();
  await page.screenshot({ path: info.outputPath('03-home-menu-mobile.png') });
  await navigation.getByRole('button', { name: 'My Enrollment', exact: true }).click();
  await expect(page).toHaveURL(/\/my-enrollment$/);
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(navigation).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  expect(await appearance()).toEqual(homeMobile);
  await page.screenshot({ path: info.outputPath('04-enrollment-menu-mobile.png') });
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open navigation' })).toBeFocused();
  await expect(navigation).toBeHidden();
});

test('PREVIEW-HOME-006 — all menu items fit without navigation scrolling', async ({ page }, info) => {
  for (const viewport of [{ width: 1440, height: 825 }, { width: 1024, height: 600 }, { width: 390, height: 844 }, { width: 390, height: 640 }, { width: 390, height: 500 }]) {
    await page.setViewportSize(viewport);
    if (viewport.width < 850) {
      await page.getByRole('button', { name: 'Open navigation' }).click();
    }
    const sidebar = page.getByRole('complementary', { name: 'Main navigation' });
    const nav = sidebar.getByRole('navigation');
    for (const button of await nav.getByRole('button').all()) {
      await expect(button).toBeInViewport({ ratio: 1 });
    }
    const points = sidebar.getByRole('region', { name: 'Points earned' });
    await expect(points).toBeInViewport({ ratio: 1 });
    expect(await nav.evaluate(element => element.scrollHeight <= element.clientHeight)).toBe(true);
    expect(await sidebar.evaluate(element => element.scrollHeight <= element.clientHeight)).toBe(true);
    const lastItem = await nav.getByRole('button', { name: 'Account', exact: true }).boundingBox();
    const card = await points.boundingBox();
    expect(lastItem!.y + lastItem!.height).toBeLessThan(card!.y);
    await page.screenshot({ path: info.outputPath(`menu-${viewport.width}x${viewport.height}.png`) });
    if (viewport.width < 850) await page.keyboard.press('Escape');
  }
});

test('PREVIEW-HOME-007 — summary cards share header actions and keep the weekly layout', async ({ page }, info) => {
  await page.setViewportSize({ width: 1104, height: 884 });
  await expect(page.getByRole('heading', { name: 'Your Enrollment Progress', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Your place', exact: true })).toHaveCount(0);
  await expect(page.locator('.hd-card-header > .hd-card-action')).toHaveCount(4);
  await expect(page.locator('.hd-card-footer')).toHaveCount(0);
  await expect(page.getByRole('region', { name: 'News', exact: true }).locator('.hd-card-footer')).toHaveCount(0);
  const actions = [
    ['Your Enrollment Progress', 'View enrollment'], ['Your financials', 'View financials'],
    ['Announcements', 'View All'], ['This week', 'View calendar'],
  ];
  for (const [name, label] of actions) {
    const card = page.getByRole('region', { name, exact: true });
    const action = card.locator('.hd-card-header > .hd-card-action');
    await expect(action).toHaveText(label);
    await expect(action.locator('span')).toHaveCSS('text-decoration-line', 'underline');
    const heading = await card.getByRole('heading', { level: 2 }).boundingBox();
    const link = await action.boundingBox();
    expect(link!.x).toBeGreaterThanOrEqual(heading!.x + heading!.width);
    expect(Math.abs(link!.y - heading!.y)).toBeLessThan(12);
  }
  await page.screenshot({ path: info.outputPath('01-consistent-actions-desktop.png'), fullPage: true });
  await page.getByRole('button', { name: 'View calendar', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Your calendar' })).toContainText('20 July 2027');
  await expect(page.getByRole('dialog')).toContainText('24 July 2027');
  await page.getByRole('dialog').getByRole('button', { name: /Meet your student community/ }).click();
  await expect(page.getByRole('dialog')).toContainText('Student Union');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'View calendar', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'View All', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Residence move-in booking is open');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'View financials', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('$43,000');
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('heading', { name: 'Your Enrollment Progress', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await page.goto('/dashboard');
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: info.outputPath('02-consistent-actions-mobile.png'), fullPage: true });
  await page.getByRole('link', { name: 'View enrollment', exact: true }).click();
  await expect(page).toHaveURL(/\/my-enrollment$/);
  await expect(page.getByRole('heading', { name: 'My Enrollment', exact: true })).toBeVisible();
});

test('PREVIEW-HOME-008 — archway hero destinations work on desktop and mobile', async ({ page }, info) => {
  const hero = page.getByRole('region', { name: 'Welcome to Northbridge' });
  const destinations = hero.getByRole('navigation', { name: 'Explore campus' });
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 1104, height: 884 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await expect(destinations.getByRole('button')).toHaveCount(4);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
    const frame = (await hero.boundingBox())!;
    const boxes = [];
    for (const button of await destinations.getByRole('button').all()) {
      const box = (await button.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(frame.x);
      expect(box.x + box.width).toBeLessThanOrEqual(frame.x + frame.width);
      expect(box.y + box.height).toBeLessThanOrEqual(frame.y + frame.height);
      boxes.push(box);
    }
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      expect(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y).toBe(true);
    }
    await page.screenshot({ path: info.outputPath('hero-' + viewport.width + '.png') });
    for (const [name, hint] of [['Library', 'Classrooms & study spaces'], ['Sports Center', 'Sports & campus events'], ['Fraternity House', 'Social & community events'], ['Student Union', 'Clubs & student life']]) {
      const marker = destinations.getByRole('button', { name, exact: true });
      await marker.click();
      const dialog = page.getByRole('dialog', { name, exact: true });
      await expect(dialog).toContainText(hint);
      await page.keyboard.press('Escape');
      await expect(marker).toBeFocused();
    }
  }
});
