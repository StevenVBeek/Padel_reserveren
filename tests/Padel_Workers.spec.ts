import { test, expect } from '@playwright/test';

// === Doeldatum 1x berekenen bij script-start ===
const baseDate = new Date();
baseDate.setDate(baseDate.getDate() + 5);

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const day = String(baseDate.getDate()).padStart(2, "0");
const month = months[baseDate.getMonth()];
const weekday = weekdays[baseDate.getDay()];

const formattedDate = `${weekday} ${day} ${month}`;
console.log(`Doeldatum voor reservering (vastgezet bij start): ${formattedDate}`);

// Functie om een tijdslot 1x te proberen
async function reserveTime(page, time) {
  // Login
  await page.goto('https://reserveer.clubpellikaan.nl/Connect/mrmLogin.aspx');
  await page.getByRole('textbox', { name: 'Email Address' }).fill('steven.vanbeek@outlook.com');
  await page.getByRole('textbox', { name: 'Email Address' }).press('Tab');
  await page.getByRole('textbox', { name: 'PIN' }).fill('0964');
  await page.getByRole('button', { name: 'Login' }).click();

  // Activiteit kiezen
  await page.locator('#ctl00_MainContent__advanceSearchResultsUserControl_Activities_ctrl0_lnkActivitySelect_lg').click();

  // Doeldatum selecteren
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

  // 1 poging om tijdslot te reserveren
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] [${time}] Eenmalige poging om te reserveren`);

  await page.reload({ waitUntil: 'domcontentloaded' });

  const slot = page.getByText(time).nth(1);

  if (await slot.isVisible()) {
    await slot.dblclick();
    const bookButton = page.getByRole('button', { name: 'Book' });
    try {
      await expect(bookButton).toBeVisible({ timeout: 1000 });
      await expect(bookButton).toBeEnabled({ timeout: 1000 });
      await bookButton.click();
      console.log(`[${timestamp}] [${time}] Gelukt! Tijdslot geboekt voor ${formattedDate}.`);
    } catch {
      throw new Error(`[${timestamp}] [${time}] Book-knop niet beschikbaar → reservering mislukt.`);
    }
  } else {
    throw new Error(`[${timestamp}] [${time}] Slot ${time} NIET zichtbaar → reservering mislukt.`);
  }

  // Logout
  await page.getByRole('link', { name: 'Logout' }).click();
}

// Worker 1 → 19:45
test('reserveer 19:45', async ({ page }) => {
  test.setTimeout(2 * 60 * 1000); // max 2 minuten runtime
  await reserveTime(page, '19:45');
});

// Worker 2 → 20:30
test('reserveer 20:30', async ({ page }) => {
  test.setTimeout(2 * 60 * 1000); // max 2 minuten runtime
  await reserveTime(page, '20:30');
});
