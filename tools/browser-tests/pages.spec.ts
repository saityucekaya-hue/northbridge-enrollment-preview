import { test, expect } from '@playwright/test';

test('PREVIEW-PAGES-001 — published routes, assets and navigation survive refresh', async ({ page }, info) => {
  test.skip(!process.env.PAGES_SITE_URL, 'Set PAGES_SITE_URL to the production-shaped preview or published site.');
  const root = process.env.PAGES_SITE_URL!;
  const failures: string[] = [];
  page.on('pageerror', error => failures.push(error.message));
  page.on('response', response => { if (response.status() >= 400) failures.push(response.status() + ' ' + response.url().split('?')[0]); });
  for (const [route, heading] of [['dashboard/', 'Welcome back, Jordan'], ['my-enrollment/', 'My Enrollment']]) {
    const response = await page.goto(root + route);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: info.outputPath(route.replace('/', '') + '.png') });
  }
  await page.getByRole('complementary', { name: 'Main navigation' }).getByRole('button', { name: 'Home', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Welcome back, Jordan', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'View enrollment', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'My Enrollment', exact: true })).toBeVisible();
  const walkthrough = await page.goto(root + 'my-enrollment-walkthrough/');
  expect(walkthrough?.status()).toBe(200);
  await expect(page.getByRole('heading', { name: 'Your next chapter starts here', exact: true })).toBeVisible();
  expect(failures).toEqual([]);
});
