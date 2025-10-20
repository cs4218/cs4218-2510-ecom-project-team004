import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Enter Your Email" }).click();
  await page
    .getByRole("textbox", { name: "Enter Your Email" })
    .fill("shainemina51@gmail.com");
  await page.getByRole("textbox", { name: "Enter Your Password" }).click();
  await page
    .getByRole("textbox", { name: "Enter Your Password" })
    .fill("qwerty123");
  await page.getByRole("button", { name: "LOGIN" }).click();
  await page.getByRole("button", { name: "ADD TO CART" }).nth(1).click();
  await page.getByRole("button", { name: "ADD TO CART" }).nth(1).click();
  await page.getByRole("button", { name: "ADD TO CART" }).first().click();
  await page.getByRole("button", { name: "ADD TO CART" }).first().click();
  await page.getByRole("button", { name: "ADD TO CART" }).nth(2).click();
  await page.getByRole("button", { name: "ADD TO CART" }).nth(2).click();
  await page.getByRole("link", { name: "Cart" }).click();
  await page
    .getByRole("heading", { name: "Hello Daphne You Have 6 total" })
    .click();
  await page
    .getByText(
      "NUS T-shirtPlain NUS T-shirt for salePrice: 4.99Quantity: 2Remove"
    )
    .click();
  await page.getByText("IoTCool!Price: 10Quantity: 2Remove").click();
  await page
    .getByText("NovelA bestselling novelPrice: 14.99Quantity: 2Remove")
    .click();
  await page.getByRole("button", { name: "Paying with Card" }).click();
  await page
    .locator('iframe[name="braintree-hosted-field-number"]')
    .contentFrame()
    .getByRole("textbox", { name: "Credit Card Number" })
    .click();
  await page
    .locator('iframe[name="braintree-hosted-field-number"]')
    .contentFrame()
    .getByRole("textbox", { name: "Credit Card Number" })
    .fill("4000 1111 1111 1115");
  await page
    .locator('iframe[name="braintree-hosted-field-expirationDate"]')
    .contentFrame()
    .getByRole("textbox", { name: "Expiration Date" })
    .click();
  await page
    .locator('iframe[name="braintree-hosted-field-expirationDate"]')
    .contentFrame()
    .getByRole("textbox", { name: "Expiration Date" })
    .fill("0330");
  await page
    .locator('iframe[name="braintree-hosted-field-cvv"]')
    .contentFrame()
    .getByRole("textbox", { name: "CVV" })
    .click();
  await page
    .locator('iframe[name="braintree-hosted-field-cvv"]')
    .contentFrame()
    .getByRole("textbox", { name: "CVV" })
    .fill("123");
  await page.getByRole("button", { name: "Make Payment" }).click();
  await page
    .locator("div")
    .filter({
      hasText:
        /^NUS T-shirtPlain NUS T-shirt for salePrice : 4\.99Quantity: 2$/,
    })
    .first()
    .click();
  await page
    .locator("div")
    .filter({ hasText: /^IoTCool!Price : 10Quantity: 2$/ })
    .first()
    .click();
  await page
    .locator("div")
    .filter({ hasText: /^NovelA bestselling novelPrice : 14\.99Quantity: 2$/ })
    .first()
    .click();
});
