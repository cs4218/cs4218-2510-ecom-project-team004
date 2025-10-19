import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('asdf@gmail.com');
  await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('asdf');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await page.getByRole('button', { name: 'asdf' }).click();
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await page.getByRole('link', { name: 'Profile' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('asdfghij');
  await page.getByRole('button', { name: 'UPDATE' }).click();
  await page.goto('http://localhost:3000/dashboard/user/profile');
  await expect(page.getByRole('list')).toContainText('asdfghij');
  await page.goto('http://localhost:3000/dashboard/user');
  await expect(page.getByRole('main')).toContainText('asdfghij');
  await page.getByRole('link', { name: 'Profile' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('asdf');
  await page.getByRole('button', { name: 'UPDATE' }).click();
  await page.goto('http://localhost:3000/dashboard/user/profile');
  await expect(page.getByRole('list')).toContainText('asdf');
  await page.goto('http://localhost:3000/dashboard/user');
  await expect(page.getByRole('main')).toContainText('asdf');
});
