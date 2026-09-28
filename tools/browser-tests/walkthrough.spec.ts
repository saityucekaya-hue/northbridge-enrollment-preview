import { expect, test } from '@playwright/test';

const titles = ['Your next chapter starts here', 'Start with your ToDo list', 'Find the tasks you need', 'Choose what comes first', 'Submitted and being checked', 'See how far you have come', 'Keep an eye on deadlines', 'A little help along the way'];

for (const viewport of [{ width: 1440, height: 1000 }, { width: 1104, height: 884 }, { width: 390, height: 844 }, { width: 360, height: 740 }]) {
  test(`PREVIEW-ENR-008 — walkthrough starts, guides and finishes at ${viewport.width}px`, async ({ page }, info) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url().split('?')[0]}`); });
    await page.setViewportSize(viewport);
    await page.goto('/my-enrollment-walkthrough');
    await expect(page).toHaveTitle('Enrollment walkthrough · Northbridge University');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(page.locator('vite-error-overlay')).toHaveCount(0);
    for (let step = 0; step < titles.length; step++) {
      await expect(dialog.getByRole('heading')).toHaveText(titles[step]);
      await expect(dialog).toHaveAttribute('aria-busy', 'false');
      await expect(dialog.getByRole('heading')).toBeFocused();
      await expect(dialog.getByText(`Step ${step + 1} of 8`, { exact: true })).toBeVisible();
      const card = await page.locator('.en-tour-card').boundingBox();
      const spotlight = await page.locator('.en-tour-spotlight').boundingBox();
      expect(card!.x).toBeGreaterThanOrEqual(0);
      expect(card!.y).toBeGreaterThanOrEqual(0);
      expect(card!.x + card!.width).toBeLessThanOrEqual(viewport.width);
      expect(card!.y + card!.height).toBeLessThanOrEqual(viewport.height);
      expect(spotlight!.width).toBeGreaterThan(20);
      expect(spotlight!.height).toBeGreaterThan(20);
      const overlaps = spotlight!.x < card!.x + card!.width && spotlight!.x + spotlight!.width > card!.x && spotlight!.y < card!.y + card!.height && spotlight!.y + spotlight!.height > card!.y;
      expect(overlaps).toBe(false);
      if ([0, 3, 6, 7].includes(step)) await page.screenshot({ path: info.outputPath(`step-${step + 1}.png`) });
      if (step === 2) {
        await dialog.getByRole('button', { name: 'Back', exact: true }).click();
        await expect(dialog.getByRole('heading')).toHaveText(titles[1]);
        await dialog.getByRole('button', { name: 'Next', exact: true }).click();
      }
      await page.keyboard.press('Tab');
      await expect(dialog.locator(':focus')).toHaveCount(1);
      await dialog.getByRole('button', { name: step === 7 ? 'Finish tour' : 'Next', exact: true }).click();
    }
    await expect(page).toHaveURL(/\/my-enrollment$/);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3');
    await expect(page.getByRole('article')).toHaveCount(8);
    await page.getByRole('button', { name: /^Sort tasks:/ }).click();
    await page.getByRole('menuitemradio', { name: 'Fastest' }).click();
    await expect(page.getByRole('region', { name: 'ToDo tasks' }).getByRole('article').first()).toHaveAccessibleName('FERPA access');
    expect(errors).toEqual([]);
  });
}

test('PREVIEW-ENR-009 — walkthrough skips, escapes and restarts without changing tasks', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/my-enrollment');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.goto('/my-enrollment-walkthrough');
  await expect(page.locator('.en-tour-card')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.en-tour-copy')).toHaveCSS('animation-name', 'none');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveAttribute('aria-busy', 'false');
  await page.reload();
  await expect(page.getByRole('dialog').getByRole('heading')).toHaveText(titles[0]);
  await page.getByRole('button', { name: 'Skip tour' }).click();
  await expect(page).toHaveURL(/\/my-enrollment$/);
  await page.goto('/my-enrollment-walkthrough');
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(/\/my-enrollment$/);
  await page.goto('/#my-enrollment-walkthrough');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Close walkthrough' }).click();
  await expect(page).toHaveURL(/\/#my-enrollment$/);
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3');
  await expect(page.getByRole('article')).toHaveCount(8);
  await page.screenshot({ path: info.outputPath('normal-page-after-exit.png') });
});

test('PREVIEW-ENR-010 — tour scroll and spotlight move through intermediate positions', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/my-enrollment-walkthrough');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toHaveAttribute('aria-busy', 'false');
  const startScroll = await page.evaluate(() => window.scrollY);
  await dialog.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(dialog).toHaveAttribute('aria-busy', 'true');
  await expect(dialog.getByRole('button', { name: 'Next', exact: true })).toBeDisabled();
  // Observe rendered frames only: no injected application state or simulated scrolling.
  const frames = await page.evaluate(() => new Promise<{ scroll: number; width: number; height: number }[]>(resolve => {
    const samples: { scroll: number; width: number; height: number }[] = [];
    function sample() {
      const spot = document.querySelector('.en-tour-spotlight')!.getBoundingClientRect();
      samples.push({ scroll: window.scrollY, width: spot.width, height: spot.height });
      if (samples.length === 16) resolve(samples); else requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  }));
  expect(new Set(frames.map(frame => frame.scroll)).size).toBeGreaterThan(3);
  expect(new Set(frames.map(frame => Math.round(frame.height))).size).toBeGreaterThan(3);
  await expect(dialog).toHaveAttribute('aria-busy', 'false');
  const endScroll = await page.evaluate(() => window.scrollY);
  expect(endScroll).toBeGreaterThan(startScroll + 100);
  expect(frames.some(frame => frame.scroll > startScroll && frame.scroll < endScroll)).toBe(true);
  await expect(dialog.getByRole('heading')).toBeFocused();
  await page.screenshot({ path: info.outputPath('smooth-scroll-arrival.png') });
  await dialog.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(dialog).toHaveAttribute('aria-busy', 'true');
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(/\/my-enrollment$/);
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3');
  expect(errors).toEqual([]);
});
