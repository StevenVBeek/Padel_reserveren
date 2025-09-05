import { test, expect } from '@playwright/test';

// Razendsnelle functie om een tijdslot te reserveren
async function reserveTime(page, time) {
  // Login
  await page.goto('https://reserveer.clubpellikaan.nl/Connect/mrmLogin.aspx');
  await page.getByRole('textbox', { name: 'Email Address' }).fill('steven.vanbeek@outlook.com');
  await page.getByRole('textbox', { name: 'Email Address' }).press('Tab');
  await page.getByRole('textbox', { name: 'PIN' }).fill('0964');
  await page.getByRole('button', { name: 'Login' }).click();

  // Selecteer activiteit
  await page.locator('#ctl00_MainContent__advanceSearchResultsUserControl_Activities_ctrl0_lnkActivitySelect_lg').click();

  // Bereken doel-datum: vandaag + 5 dagen
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 4);

  // Handmatige korte maandnamen (3 letters, geen "Sept")
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const day = String(targetDate.getDate()).padStart(2, "0");
  const month = months[targetDate.getMonth()];
  const weekday = weekdays[targetDate.getDay()];

  // Format exact zoals de site: "Wed 10 Sep"
  const formattedDate = `${weekday} ${day} ${month}`;
  console.log(`Doeldatum voor reservering: ${formattedDate}`);

  // Klik net zolang op "Next Week" totdat de juiste datum zichtbaar is
  let dateVisible = false;
  while (!dateVisible) {
    try {
      const dateElement = page.getByText(formattedDate, { exact: true });
      if (await dateElement.isVisible()) {
        await dateElement.click();
        dateVisible = true;
        console.log(`Doeldatum gevonden en aangeklikt: ${formattedDate}`);
      } else {
        throw new Error('Doeldatum nog niet zichtbaar');
      }
    } catch {
      await page.getByRole('button', { name: 'Next Week ' }).click();
      await page.waitForTimeout(200);
    }
  }

  // Probeer reserveren
  let reserved = false;
  while (!reserved) {
    try {
      const timestamp = new Date().toLocaleTimeString();
      console.log(`[${timestamp}] [${time}] Poging om te reserveren`);

      await page.reload({ waitUntil: 'domcontentloaded' });

      const slot = page.getByText(time).nth(1);

      if (await slot.isVisible()) {
        await slot.dblclick();

        const bookButton = page.getByRole('button', { name: 'Book' });
        await expect(bookButton).toBeVisible({ timeout: 500 });
        await expect(bookButton).toBeEnabled({ timeout: 500 });

        await bookButton.click();
        reserved = true;
        console.log(`[${timestamp}] [${time}] Gelukt! Tijdslot geboekt voor ${formattedDate}.`);
      } else {
        throw new Error(`Slot ${time} niet zichtbaar`);
      }
    } catch {
      await page.waitForTimeout(20);
    }
  }

  // Logout
  await page.getByRole('link', { name: 'Logout' }).click();
}

// Worker 1 → 19:45
test('reserveer 19:45', async ({ page }) => {
  test.setTimeout(600_000);
  await reserveTime(page, '21:15');
});

// Worker 2 → 20:30
test('reserveer 20:30', async ({ page }) => {
  test.setTimeout(600_000);
  await reserveTime(page, '20:30');
});
