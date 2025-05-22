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

  });
