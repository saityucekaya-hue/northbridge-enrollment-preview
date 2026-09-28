import { expect, test } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

test('PREVIEW-TYPE-001 — Home and Enrollment load Google Sans Flex at desktop and phone sizes', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url().split('?')[0]}`); });
  for (const [route, shell] of [['dashboard', '.hd-shell'], ['my-enrollment', '.en-shell']]) {
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${route}`);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator('vite-error-overlay')).toHaveCount(0);
      await expect(page.locator(shell)).toHaveCSS('font-family', '"Google Sans Flex", Arial, sans-serif');
      await expect(page.locator(shell).getByRole('heading', { level: 1 })).toBeVisible();
      expect(await page.evaluate(() => [...document.fonts].some(font => font.family.replace(/['"]/g, '') === 'Google Sans Flex' && font.status === 'loaded'))).toBe(true);
      const bodyWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(width);
      if (route === 'my-enrollment') {
        const sort = page.getByRole('button', { name: /^Sort tasks:/ });
        await sort.click();
        await page.getByRole('menuitemradio', { name: 'Fastest', exact: true }).click();
        await expect(page.getByRole('region', { name: 'ToDo tasks' }).getByRole('article').first()).toHaveAccessibleName('FERPA access');
        await sort.scrollIntoViewIfNeeded();
      }
      await page.screenshot({ path: info.outputPath(`${route}-${width}.png`), animations: 'disabled' });
    }
  }
  await writeFile(info.outputPath('browser-errors.json'), JSON.stringify(errors));
  expect(errors).toEqual([]);
});
