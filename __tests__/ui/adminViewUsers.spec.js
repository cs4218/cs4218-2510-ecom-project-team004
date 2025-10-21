import { test, expect } from '@playwright/test';

// Preconditions:
// Admin user must be created in database
// User(s) must be created in database
const testAdmin = {
  name: 'testadmin',
  email: 'testadmin@vault.com',
  password: 'test',
}

const users = ['Daniel', 'Melanie Rice'];

test.beforeEach(async ({ page }) => {
  // Set up logged in state (admin user)
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(testAdmin.email);
  await page.getByRole('textbox', { name: 'Enter Your Email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(testAdmin.password);
  await page.getByRole('button', { name: 'LOGIN' }).click();
  
  // Navigate to View Users
  await page.getByRole('button', { name: testAdmin.name }).click();
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await page.getByRole('link', { name: 'Users' }).click();
})

test('has title', async ({ page }) => {
  await expect(page).toHaveTitle(/Dashboard - All Users/);
});

test('should allow admin to view list of users', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'All Users' })).toBeVisible();
  await expect(page.getByText(users[0])).toBeVisible();
  await expect(page.getByText(users[1])).toBeVisible();
});