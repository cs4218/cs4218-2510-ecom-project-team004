import { test, expect } from '@playwright/test';
import axios from 'axios';

test.describe.configure({ mode: "serial" });

async function resetDB(request) {
    const res = await request.post("http://localhost:3000/api/v1/test/reset");
    if (!res.ok()) {
        throw new Error(`DB reset failed: ${res.status()} ${await res.text()}`);
    }
}

test.beforeEach(async ({ page, request }) => {
    await resetDB(request);
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

test.describe("New category", () => {
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
    test("Should change name of category if edited", async ({ page }) => {
        await page.getByRole('button', { name: 'Edit' }).nth(2).click();
        await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).click();
        await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).fill('Furniture');
        await page.getByRole('dialog').getByRole('button', { name: 'Submit' }).click();
        await expect(page.locator('tbody')).toContainText('Furniture');
    });

    test("Should not change name of category if name is empty", async ({ page }) => {
        await page.getByRole('button', { name: 'Edit' }).nth(2).click();
        await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).click();
        await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).fill('');
        await page.getByRole('dialog').getByRole('button', { name: 'Submit' }).click();
        await expect(page.getByText('Something went wrong')).toBeVisible();
    })
});

test.describe("Delete category", () => {
    test("Should delete category when delete button is pressed", async ({ page }) => {
        const clothingRow = page.locator('tbody tr', { hasText: 'Clothing' });
        await clothingRow.getByRole('button', { name: 'Delete' }).click();
        await expect(page.locator('tbody')).not.toContainText('Clothing');
    });
});