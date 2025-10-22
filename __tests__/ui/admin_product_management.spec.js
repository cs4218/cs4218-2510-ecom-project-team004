import { test, expect } from '@playwright/test';

test.describe.configure({ mode: "parallel" });

test.describe("Create new product", () => {
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
        await page.getByRole('link', { name: 'Create Product' }).click();
    });

    test("Should create new product", async ({ page }) => {
        await page.getByRole('combobox', { name: 'Category' }).click();
        await page.getByRole('combobox', { name: 'Category' }).click();
        await page.getByText('Clothing').nth(1).click();
        await page.getByRole('textbox', { name: 'write a name' }).click();
        await page.getByRole('textbox', { name: 'write a name' }).fill('Shirt');
        await page.getByRole('textbox', { name: 'write a description' }).click();
        await page.getByRole('textbox', { name: 'write a description' }).fill('A shirt');
        await page.getByPlaceholder('write a Price').click();
        await page.getByPlaceholder('write a Price').fill('2.99');
        await page.getByPlaceholder('write a quantity').click();
        await page.getByPlaceholder('write a quantity').fill('5');
        await page.getByRole('combobox', { name: 'Shipping' }).click();
        await page.getByText('No').click();
        await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();
        await page.getByRole('link', { name: 'Products' }).click();
        await expect(page.getByRole('link', { name: 'Shirt Shirt A shirt' })).toBeVisible();
    });

    test("Should see error message when not inserting category", async ({ page }) => {
        await page.getByRole('textbox', { name: 'write a name' }).click();
        await page.getByRole('textbox', { name: 'write a name' }).fill('Shirt');
        await page.getByRole('textbox', { name: 'write a description' }).click();
        await page.getByRole('textbox', { name: 'write a description' }).fill('A shirt');
        await page.getByPlaceholder('write a Price').click();
        await page.getByPlaceholder('write a Price').fill('2.99');
        await page.getByPlaceholder('write a quantity').click();
        await page.getByPlaceholder('write a quantity').fill('5');
        await page.getByLabel('Shipping').first().click();
        await page.getByText('Yes').click();
        await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();
        await expect(page.getByText('something went wrong')).toBeVisible();
    });

    test("Should see error message when not inserting name", async ({ page }) => {
        await page.getByRole('combobox', { name: 'Category' }).click();
        await page.getByRole('combobox', { name: 'Category' }).click();
        await page.getByText('Clothing').nth(1).click();
        await page.getByRole('textbox', { name: 'write a description' }).click();
        await page.getByRole('textbox', { name: 'write a description' }).fill('A shirt');
        await page.getByPlaceholder('write a Price').click();
        await page.getByPlaceholder('write a Price').fill('2.99');
        await page.getByPlaceholder('write a quantity').click();
        await page.getByPlaceholder('write a quantity').fill('5');
        await page.getByLabel('Shipping').first().click();
        await page.getByText('Yes').click();
        await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();
        await expect(page.getByText('something went wrong')).toBeVisible();
    });

    test("Should see error message when not inserting description", async ({ page }) => {
        await page.getByRole('combobox', { name: 'Category' }).click();
        await page.getByRole('combobox', { name: 'Category' }).click();
        await page.getByText('Clothing').nth(1).click();
        await page.getByRole('textbox', { name: 'write a name' }).click();
        await page.getByRole('textbox', { name: 'write a name' }).fill('Shirt');
        await page.getByPlaceholder('write a Price').click();
        await page.getByPlaceholder('write a Price').fill('2.99');
        await page.getByPlaceholder('write a quantity').click();
        await page.getByPlaceholder('write a quantity').fill('5');
        await page.getByLabel('Shipping').first().click();
        await page.getByText('Yes').click();
        await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();
        await expect(page.getByText('something went wrong')).toBeVisible();
    });

    test("Should see error message when not inserting price", async ({ page }) => {
        await page.getByRole('combobox', { name: 'Category' }).click();
        await page.getByRole('combobox', { name: 'Category' }).click();
        await page.getByText('Clothing').nth(1).click();
        await page.getByRole('textbox', { name: 'write a name' }).click();
        await page.getByRole('textbox', { name: 'write a name' }).fill('Shirt');
        await page.getByRole('textbox', { name: 'write a description' }).click();
        await page.getByRole('textbox', { name: 'write a description' }).fill('A shirt');
        await page.getByPlaceholder('write a quantity').click();
        await page.getByPlaceholder('write a quantity').fill('5');
        await page.getByLabel('Shipping').first().click();
        await page.getByText('Yes').click();
        await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();
        await expect(page.getByText('something went wrong')).toBeVisible();
    });

    test("Should see error message when not inserting quantity", async ({ page }) => {
        await page.getByRole('combobox', { name: 'Category' }).click();
        await page.getByRole('combobox', { name: 'Category' }).click();
        await page.getByText('Clothing').nth(1).click();
        await page.getByRole('textbox', { name: 'write a name' }).click();
        await page.getByRole('textbox', { name: 'write a name' }).fill('Shirt');
        await page.getByRole('textbox', { name: 'write a description' }).click();
        await page.getByRole('textbox', { name: 'write a description' }).fill('A shirt');
        await page.getByPlaceholder('write a Price').click();
        await page.getByPlaceholder('write a Price').fill('2.99');
        await page.getByLabel('Shipping').first().click();
        await page.getByText('Yes').click();
        await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();
        await expect(page.getByText('something went wrong')).toBeVisible();
    });
});

test.describe("Update product", () => {
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
        await page.getByRole('link', { name: 'Create Product' }).click();
        await page.getByRole('combobox', { name: 'Category' }).click();
        await page.getByRole('combobox', { name: 'Category' }).click();
        await page.getByText('Clothing').nth(1).click();
        await page.getByRole('textbox', { name: 'write a name' }).click();
        await page.getByRole('textbox', { name: 'write a name' }).fill('Trousers');
        await page.getByRole('textbox', { name: 'write a description' }).click();
        await page.getByRole('textbox', { name: 'write a description' }).fill('Some trousers');
        await page.getByPlaceholder('write a Price').click();
        await page.getByPlaceholder('write a Price').fill('3.99');
        await page.getByPlaceholder('write a quantity').click();
        await page.getByPlaceholder('write a quantity').fill('6');
        await page.getByRole('combobox', { name: 'Shipping' }).click();
        await page.getByText('No').click();
        await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();
        await page.getByRole('link', { name: 'Products' }).click();
    });

    test("Should update name and description of product", async ({ page }) => {
        await page.getByRole('link', { name: 'Trousers Trousers Some trousers' }).click();
        await page.getByRole('textbox', { name: 'write a name' }).click();
        await page.getByRole('textbox', { name: 'write a name' }).fill('Hat');
        await page.getByRole('textbox', { name: 'write a description' }).click();
        await page.getByRole('textbox', { name: 'write a description' }).fill('A hat');
        await page.getByRole('button', { name: 'UPDATE PRODUCT' }).click();
        await page.getByRole('link', { name: 'Products' }).click();
        await expect(page.getByRole('link', { name: 'Hat Hat A Hat' })).toBeVisible();
    });

    test("Should see error message when not inserting name", async ({ page }) => {
        await page.getByRole('link', { name: 'Trousers Trousers Some trousers' }).click();
        await page.getByRole('textbox', { name: 'write a name' }).click();
        await page.getByRole('textbox', { name: 'write a name' }).fill('');
        await page.getByRole('textbox', { name: 'write a description' }).click();
        await page.getByRole('textbox', { name: 'write a description' }).fill('A shirt');
        await page.getByPlaceholder('write a Price').click();
        await page.getByPlaceholder('write a Price').fill('2.99');
        await page.getByPlaceholder('write a quantity').click();
        await page.getByPlaceholder('write a quantity').fill('5');
        await page.getByRole('button', { name: 'UPDATE PRODUCT' }).click();
        await expect(page.getByText('something went wrong')).toBeVisible();
    });

    test("Should see error message when not inserting description", async ({ page }) => {
        await page.getByRole('link', { name: 'Trousers Trousers Some trousers' }).click();
        await page.getByRole('textbox', { name: 'write a name' }).click();
        await page.getByRole('textbox', { name: 'write a name' }).fill('Shirt');
        await page.getByRole('textbox', { name: 'write a description' }).click();
        await page.getByRole('textbox', { name: 'write a description' }).fill('');
        await page.getByPlaceholder('write a Price').click();
        await page.getByPlaceholder('write a Price').fill('2.99');
        await page.getByPlaceholder('write a quantity').click();
        await page.getByPlaceholder('write a quantity').fill('5');
        await page.getByRole('button', { name: 'UPDATE PRODUCT' }).click();
        await expect(page.getByText('something went wrong')).toBeVisible();
    });

    test("Should see error message when not inserting price", async ({ page }) => {
        await page.getByRole('link', { name: 'Trousers Trousers Some trousers' }).click();
        await page.getByRole('textbox', { name: 'write a name' }).click();
        await page.getByRole('textbox', { name: 'write a name' }).fill('Shirt');
        await page.getByRole('textbox', { name: 'write a description' }).click();
        await page.getByRole('textbox', { name: 'write a description' }).fill('A shirt');
        await page.getByPlaceholder('write a Price').click();
        await page.getByPlaceholder('write a Price').fill('');
        await page.getByPlaceholder('write a quantity').click();
        await page.getByPlaceholder('write a quantity').fill('5');
        await page.getByRole('button', { name: 'UPDATE PRODUCT' }).click();
        await expect(page.getByText('something went wrong')).toBeVisible();
    });

    test("Should see error message when not inserting quantity", async ({ page }) => {
        await page.getByRole('link', { name: 'Trousers Trousers Some trousers' }).click();
        await page.getByRole('textbox', { name: 'write a name' }).click();
        await page.getByRole('textbox', { name: 'write a name' }).fill('Shirt');
        await page.getByRole('textbox', { name: 'write a description' }).click();
        await page.getByRole('textbox', { name: 'write a description' }).fill('A shirt');
        await page.getByPlaceholder('write a Price').click();
        await page.getByPlaceholder('write a Price').fill('2.99');
        await page.getByPlaceholder('write a quantity').click();
        await page.getByPlaceholder('write a quantity').fill('');
        await page.getByRole('button', { name: 'UPDATE PRODUCT' }).click();
        await expect(page.getByText('something went wrong')).toBeVisible();
    });
});

test.describe("Delete product", () => {
    test.beforeEach(async ({ page }) => {
        // Login + go to Create Product
        await page.goto("http://localhost:3000/");
        await page.getByRole('link', { name: 'Login' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('test@test.com');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('test');
        await page.getByRole('button', { name: 'LOGIN' }).click();
        await page.getByRole('button', { name: 'test' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await page.getByRole('link', { name: 'Create Product' }).click();

        // Create a throwaway product to delete
        await page.getByRole('combobox', { name: 'Category' }).click();
        await page.getByRole('combobox', { name: 'Category' }).click();
        await page.getByText('Clothing').nth(1).click();
        await page.getByRole('textbox', { name: 'write a name' }).fill('Socks');
        await page.getByRole('textbox', { name: 'write a description' }).fill('Some socks');
        await page.getByPlaceholder('write a Price').fill('1.99');
        await page.getByPlaceholder('write a quantity').fill('2');
        await page.getByRole('combobox', { name: 'Shipping' }).click();
        await page.getByText('No').click();
        await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();

        // Go to products list
        await page.getByRole('link', { name: 'Products' }).click();
        await expect(page.getByRole('link', { name: 'Socks Socks Some socks' })).toBeVisible();
    });

    test("Should delete product when delete button is pressed", async ({ page }) => {
        // Open the product detail
        await page.getByRole('link', { name: 'Socks Socks Some socks' }).click();

        // Accept the prompt used by your delete flow
        page.once('dialog', (dialog) => dialog.accept('yes'));

        // Click delete
        await page.getByRole('button', { name: 'DELETE PRODUCT' }).click();

        // Back to products list and assert it's gone
        await page.getByRole('link', { name: 'Products' }).click();
        await expect(page.getByRole('link', { name: 'Socks Socks Some socks' })).toHaveCount(0);
    });
});