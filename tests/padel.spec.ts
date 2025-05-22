import { test, expect } from '@playwright/test';

test('test',async ({ page }) => {
  test.setTimeout(600_000);
  await page.goto('https://reserveer.clubpellikaan.nl/Connect/mrmLogin.aspx');

  // Login
  await page.getByRole('textbox', { name: 'Email Address' }).fill('steven.vanbeek@outlook.com');
  await page.getByRole('textbox', { name: 'Email Address' }).press('Tab');
  await page.getByRole('textbox', { name: 'PIN' }).fill('0964');
  await page.getByRole('button', { name: 'Login' }).click();

  // Selecteer activiteit + week
  await page.locator('#ctl00_MainContent__advanceSearchResultsUserControl_Activities_ctrl0_lnkActivitySelect_lg').click();
  await page.getByRole('button', { name: 'Next Week ' }).click();
  await page.getByRole('button', { name: 'Next Week ' }).click();
  await page.getByRole('button', { name: 'Next Week ' }).click();
  await page.getByRole('button', { name: 'Next Week ' }).click();
  await page.getByRole('button', { name: 'Next Week ' }).click();

  // Wacht en probeer maximaal 1000 keer te klikken
  let clicked = false;
  let attempts = 0;
  const maxAttempts = 1000;

  while (!clicked && attempts < maxAttempts) {
    try {
      console.log(`Poging ${attempts + 1}`);

      await page.goto('https://reserveer.clubpellikaan.nl/Connect/mrmProductStatus.aspx');

      //Padel baan 2 19:45
      await page.locator('input[name="ctl00\\$MainContent\\$grdResourceView\\$ctl19\\$ctl01"]').click({ timeout: 1000 });

      clicked = true;
      console.log('Klikken gelukt! Eerste baan is gereseerveerd.');
    } catch (e) {
      console.log('Knop nog niet beschikbaar, opnieuw proberen over 2 seconden...');
      await page.waitForTimeout(1000);
      attempts++;
    }
  }
await page.getByRole('button', { name: 'Book' }).click();
    // Check of het gelukt is om te klikken
  if (!clicked) {
    console.log(`Na ${maxAttempts} pogingen is het nog steeds niet gelukt om te klikken.`);
    return;
  }

  await page.getByRole('link', { name: 'Home' }).click();
  await page.locator('#ctl00_MainContent__advanceSearchResultsUserControl_Activities_ctrl0_lnkActivitySelect_lg').click();
  await page.getByRole('button', { name: 'Next Week ' }).click();
  await page.getByRole('button', { name: 'Next Week ' }).click();
  await page.getByRole('button', { name: 'Next Week ' }).click();
  await page.getByRole('button', { name: 'Next Week ' }).click();
  await page.getByRole('button', { name: 'Next Week ' }).click();

    let clicked1 = false;
    let attempts1 = 0;

  while (!clicked1 && attempts1 < maxAttempts) {
    try {
      console.log(`Poging ${attempts1 + 1}`);

      await page.goto('https://reserveer.clubpellikaan.nl/Connect/mrmProductStatus.aspx');

      //Padel baan 2 20:30
      await page.locator('input[name="ctl00\\$MainContent\\$grdResourceView\\$ctl20\\$ctl01"]').click({ timeout: 1000 });

      clicked1 = true;
      console.log('Klikken gelukt! Tweede baan is gereseerveerd.');
    } catch (e) {
      console.log('Knop nog niet beschikbaar, opnieuw proberen over 2 seconden...');
      await page.waitForTimeout(1000);
      attempts1++;
    }
  }

       await page.getByRole('button', { name: 'Book' }).click();
  // Check of het gelukt is om te klikken
  if (!clicked1) {
    console.log(`Na ${maxAttempts} pogingen is het nog steeds niet gelukt om te klikken.`);
    return;
  }

  // Boek en logout
  //await page.getByRole('button', { name: 'Book' }).click();
  await page.getByRole('link', { name: 'Logout' }).click();
});
