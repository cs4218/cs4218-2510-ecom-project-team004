import { test, expect } from '@playwright/test';
import userModel from '../../models/userModel';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

test.beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL);
});

test.afterAll(async () => {
  await mongoose.disconnect();
});

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.evaluate(() => localStorage.clear()); // To ensure auth state is cleared
  await page.getByRole('link', { name: 'Register' }).click();
})

test.afterEach(async () => {
  await userModel.deleteOne({ email: testUser.email });
})

const testUser = {
  name: 'John Doe',
  email: 'test@example.com',
  password: 'password123',
  phone: '1234567890',
  address: '123 Street',
  DOB: '2000-01-01',
  answer: 'Football',
}

test('has title', async ({ page }) => {
  await expect(page).toHaveTitle(/Register - Ecommerce App/);
});

test('should have registration form', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'REGISTER FORM' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Enter Your Name' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Enter Your Email' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Enter Your Password' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Enter Your Phone' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Enter Your Address' })).toBeVisible();
  await expect(page.getByPlaceholder('Enter Your DOB')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'What is Your Favorite sports' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'REGISTER' })).toBeVisible();
});

test('should allow me to register', async ({ page }) => {
  await page.getByRole('textbox', { name: 'Enter Your Name' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Name' }).fill(testUser.name);
  await page.getByRole('textbox', { name: 'Enter Your Name' }).press('Tab');
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(testUser.email);
  await page.getByRole('textbox', { name: 'Enter Your Email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(testUser.password);
  await page.getByRole('textbox', { name: 'Enter Your Password' }).press('Tab');
  await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill(testUser.phone);
  await page.getByRole('textbox', { name: 'Enter Your Phone' }).press('Tab');
  await page.getByRole('textbox', { name: 'Enter Your Address' }).fill(testUser.address);
  await page.getByRole('textbox', { name: 'Enter Your Address' }).press('Tab');
  await page.getByPlaceholder('Enter Your DOB').fill(testUser.DOB);
  await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).click();
  await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).fill(testUser.answer);
  await page.getByRole('button', { name: 'REGISTER' }).click();
  await expect(page.getByText('Register Successfully, please login')).toBeVisible();
  await expect(page).toHaveURL('http://localhost:3000/login');
});

// Precondition: Email must be pre-registered in the database
test('should not allow multiple registration with same email', async ({ page }) => {
  await page.getByRole('textbox', { name: 'Enter Your Name' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Name' }).fill(testUser.name);
  await page.getByRole('textbox', { name: 'Enter Your Name' }).press('Tab');
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('testuser@vault.com'); // Already in database
  await page.getByRole('textbox', { name: 'Enter Your Email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(testUser.password);
  await page.getByRole('textbox', { name: 'Enter Your Password' }).press('Tab');
  await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill(testUser.phone);
  await page.getByRole('textbox', { name: 'Enter Your Phone' }).press('Tab');
  await page.getByRole('textbox', { name: 'Enter Your Address' }).fill(testUser.address);
  await page.getByRole('textbox', { name: 'Enter Your Address' }).press('Tab');
  await page.getByPlaceholder('Enter Your DOB').fill(testUser.DOB);
  await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).click();
  await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).fill(testUser.answer);
  await page.getByRole('button', { name: 'REGISTER' }).click();
  await expect(page.getByText('Already Register please login')).toBeVisible();
});