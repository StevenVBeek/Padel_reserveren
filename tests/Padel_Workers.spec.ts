import { test, expect } from '@playwright/test';

// Razendsnelle functie om een tijdslot te reserveren
async function reserveTime(page, time) {
  // Login
  await page.goto('https://reserveer.clubpellikaan.nl/Connect/mrmLogin.aspx');
  await page.getByRole('textbox', { name: 'Email Address' }).fill('steven.vanbeek@outlook.com');
  await page.getByRole('textbox', { name: 'Email Address' }).press('Tab');
  await page.getByRole('textbox', { name: 'PIN' }).fill('0964');
  await page.getByRole('button', { name: 'Login' }).click();

  // Selecteer activiteit + week
  await page.locator('#ctl00_MainContent__advanceSearchResultsUserControl_Activities_ctrl0_lnkActivitySelect_lg').click();
  for (let i = 0; i < 5; i++) {
    await page.getByRole('button', { name: 'Next Week ' }).click();
  }

  let reserved = false;
  while (!reserved) {
    try {
      const timestamp = new Date().toLocaleTimeString();
      console.log(`[${timestamp}] [${time}] Poging om te reserveren`);

      // Snelle refresh zonder de volledige pagina opnieuw op te bouwen
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

  // Logout
  await page.getByRole('link', { name: 'Logout' }).click();
}

// Worker 1 → 19:45
test('reserveer 19:45', async ({ page }) => {
  test.setTimeout(10_000);
  await reserveTime(page, '19:45');
});

// Worker 2 → 20:30
test('reserveer 20:30', async ({ page }) => {
  test.setTimeout(10_000);
  await reserveTime(page, '20:30');
});
