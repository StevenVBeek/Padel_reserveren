import { test, expect } from '@playwright/test';

// Razendsnelle functie om een tijdslot te reserveren, max 1 minuut
async function reserveTime(page, time) {
  // Login
  await page.goto('https://reserveer.clubpellikaan.nl/Connect/mrmLogin.aspx');
  await page.getByRole('textbox', { name: 'Email Address' }).fill('steven.vanbeek@outlook.com');
  await page.getByRole('textbox', { name: 'Email Address' }).press('Tab');
  await page.getByRole('textbox', { name: 'PIN' }).fill('0964');
  await page.getByRole('button', { name: 'Login' }).click();

  // Selecteer activiteit + week
  await page.locator('#ctl00_MainContent__advanceSearchResultsUserControl_Activities_ctrl0_lnkActivitySelect_lg').click();
  for (let i = 0; i < 4; i++) {
    await page.getByRole('button', { name: 'Next Week ' }).click();
  }

  let reserved = false;
  const startTime = Date.now();
  const maxDuration = 60 * 1000; // 1 minuut in milliseconden

  while (!reserved && (Date.now() - startTime < maxDuration)) {
    try {
      const timestamp = new Date().toLocaleTimeString();
      console.log(`[${timestamp}] [${time}] Poging om te reserveren`);

      // Snelle refresh zonder volledige pagina rebuild
      await page.reload({ waitUntil: 'domcontentloaded' });

      const slot = page.getByText(time).nth(1);

      if (await slot.isVisible()) {
        await slot.dblclick();

        const bookButton = page.getByRole('button', { name: 'Book' });
        await expect(bookButton).toBeVisible({ timeout: 500 });
        await expect(bookButton).toBeEnabled({ timeout: 500 });

        await bookButton.click();
        reserved = true;
        console.log(`[${timestamp}] [${time}] Gelukt! Tijdslot geboekt.`);
      } else {
        throw new Error(`Slot ${time} niet zichtbaar`);
      }
    } catch {
      // Razendsnelle retry
      await page.waitForTimeout(20);
    }
  }

  if (!reserved) {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] [${time}] Kon niet reserveren binnen 1 minuut.`);
  }

  // Logout
  await page.getByRole('link', { name: 'Logout' }).click();
}

// Worker 1 → 16:45
test('reserveer 16:45', async ({ page }) => {
  test.setTimeout(600_000);
  await reserveTime(page, '16:45');
});

// Worker 2 → 17:30
test('reserveer 17:30', async ({ page }) => {
  test.setTimeout(600_000);
  await reserveTime(page, '17:30');
});
