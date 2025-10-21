import { test, expect } from '@playwright/test';

// This suite of test cases validates the app behaviour
// when users access protected routes without log in.
// Expected outcome: 
// Redirect to login page

// Precondition: User must not be logged in
test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.evaluate(() => localStorage.clear());  // To ensure auth state is cleared
})

const productSlug = 'textbook';

test('User dashboard', async ({page}) => {
  await page.goto('http://localhost:3000/dashboard/user');

  // Should redirect to login
    await expect(page).toHaveURL('http://localhost:3000/login'); 
})

test('User orders', async ({page}) => {
  await page.goto('http://localhost:3000/dashboard/user/orders');

  await expect(page).toHaveURL('http://localhost:3000/login'); 
})

test('User profile', async ({page}) => {
  await page.goto('http://localhost:3000/dashboard/user/profile');

  await expect(page).toHaveURL('http://localhost:3000/login'); 
})

test('Admin dashboard', async ({page}) => {
  await page.goto('http://localhost:3000/dashboard/admin');

  await expect(page).toHaveURL('http://localhost:3000/login'); 
})

test('Admin create category', async ({page}) => {
  await page.goto('http://localhost:3000/dashboard/admin/create-category');

  await expect(page).toHaveURL('http://localhost:3000/login'); 
})

test('Admin create product', async ({page}) => {
  await page.goto('http://localhost:3000/dashboard/admin/create-product');

  await expect(page).toHaveURL('http://localhost:3000/login'); 
})

test('Admin update product', async ({page}) => {
  await page.goto(`http://localhost:3000/dashboard/admin/product/${productSlug}`);

  await expect(page).toHaveURL('http://localhost:3000/login'); 
})

test('Admin products', async ({page}) => {
  await page.goto('http://localhost:3000/dashboard/admin/products');

  await expect(page).toHaveURL('http://localhost:3000/login'); 
})

test('Admin users', async ({page}) => {
  await page.goto('http://localhost:3000/dashboard/admin/users');

  await expect(page).toHaveURL('http://localhost:3000/login'); 
})

test('Admin orders', async ({page}) => {
  await page.goto('http://localhost:3000/dashboard/admin/orders');

  await expect(page).toHaveURL('http://localhost:3000/login'); 
})