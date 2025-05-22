import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
await page.goto('https://reserveer.clubpellikaan.nl/Connect/mrmLogin.aspx');
await page.getByRole('textbox', { name: 'Email Address' }).click();
await page.getByRole('textbox', { name: 'Email Address' }).fill('steven.vanbeek@outlook.com');
await page.getByRole('textbox', { name: 'Email Address' }).press('Tab');
await page.getByRole('textbox', { name: 'PIN' }).fill('0964');
await page.getByRole('button', { name: 'Login' }).click();
await page.getByRole('link', { name: 'Make a Booking' }).click();
await page.getByRole('link', { name: 'Home' }).click();
await page.getByRole('link', { name: 'Logout' }).click();

});
