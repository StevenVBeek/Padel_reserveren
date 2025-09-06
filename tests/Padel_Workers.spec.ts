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

  // Datum selecteren (max 10 sec proberen)
  let dateVisible = false;
  const dateStart = Date.now();
  while (!dateVisible && Date.now() - dateStart < 10_000) {
    try {
      const dateElement = page.getByText(formattedDate, { exact: true });
      if (await dateElement.isVisible()) {
        await dateElement.click();
        dateVisible = true;
        console.log(`Doeldatum gevonden en aangeklikt: ${formattedDate}`);
      } else {
        throw new Error();
      }
    } catch {
      await page.getByRole('button', { name: 'Next Week ' }).click();
      await page.waitForTimeout(200);
    }
  }

  if (!dateVisible) {
    throw new Error(`Doeldatum ${formattedDate} niet zichtbaar binnen 10 seconden.`);
  }

  // Pogingen voor tijdslot max 2 minuten
  const startTime = Date.now();
  let reserved = false;
  while (!reserved && Date.now() - startTime < 10 * 60_000) { // 10 minuten
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] [${time}] Poging om te reserveren`);

    await page.reload({ waitUntil: 'domcontentloaded' });

    const slot = page.getByText(time).nth(1);
    if (await slot.isVisible()) {
      await slot.dblclick();
      const bookButton = page.getByRole('button', { name: 'Book' });
      try {
        await expect(bookButton).toBeVisible({ timeout: 500 });
        await expect(bookButton).toBeEnabled({ timeout: 500 });
        await bookButton.click();
        reserved = true;
        console.log(`[${timestamp}] [${time}] Gelukt! Tijdslot geboekt voor ${formattedDate}.`);
      } catch {
        console.log(`[${timestamp}] [${time}] Book-knop niet beschikbaar, opnieuw proberen...`);
      }
    }

    if (!reserved) await page.waitForTimeout(200); // 200 ms wachten
  }

  if (!reserved) {
    throw new Error(`Kan tijdslot ${time} niet reserveren binnen 2 minuten.`);
  }

  // Logout
  await page.getByRole('link', { name: 'Logout' }).click();
}

// Worker 1 → 19:45
test('reserveer 19:45', async ({ page }) => {
  test.setTimeout(10 * 60_000); // max 10 minuten per test
  await reserveTime(page, '19:45');
});

// Worker 2 → 20:30
test('reserveer 20:30', async ({ page }) => {
  test.setTimeout(10 * 60_000);
  await reserveTime(page, '20:30');
});