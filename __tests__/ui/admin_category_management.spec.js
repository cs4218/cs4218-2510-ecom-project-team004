import { test, expect } from '@playwright/test';

test.describe.configure({ mode: "parallel" });

test.describe("New category", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("http://localhost:3000/");
        await page.getByRole('link', { name: 'Login' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('test@test.com');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('test');
        await page.getByRole('button', { name: 'LOGIN' }).click();
        await page.getByRole('button', { name: 'test' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await page.getByRole('link', { name: 'Create Category' }).click();
    });

    test("Should create category", async ({ page }) => {
        await page.getByRole('textbox', { name: 'Enter new category' }).click();
        await page.getByRole('textbox', { name: 'Enter new category' }).fill('Utensils');
        await page.getByRole('button', { name: 'Submit' }).click();
        await expect(page.locator('tbody')).toContainText('Utensils');
    });

    test("Should display error if submitting with empty name", async ({ page }) => {
        await page.getByRole('button', { name: 'Submit' }).click();
        await expect(page.getByText(/Something went wrong in input form/)).toBeVisible();
    });
});

test.describe("Edit category", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("http://localhost:3000/");
        await page.getByRole('link', { name: 'Login' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('test@test.com');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('test');
        await page.getByRole('button', { name: 'LOGIN' }).click();
        await page.getByRole('button', { name: 'test' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await page.getByRole('link', { name: 'Create Category' }).click();
        await page.getByRole('textbox', { name: 'Enter new category' }).click();
        await page.getByRole('textbox', { name: 'Enter new category' }).fill('Utensils');
        await page.getByRole('button', { name: 'Submit' }).click();
    });

    test("Should change name of category if edited", async ({ page }) => {
        await page.getByRole('button', { name: 'Edit' }).nth(3).click();
        await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).click();
        await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).fill('Furniture');
        await page.getByRole('dialog').getByRole('button', { name: 'Submit' }).click();
        await expect(page.locator('tbody')).toContainText('Furniture');
    });
});