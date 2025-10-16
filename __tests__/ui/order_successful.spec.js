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
  await page.getByRole("button", { name: "Daphne" }).click();
  await page.getByRole("button", { name: "ADD TO CART" }).nth(1).click();
  await page.getByRole("button", { name: "ADD TO CART" }).first().click();
  await page.getByRole("button", { name: "ADD TO CART" }).nth(1).click();
  await page.getByRole("button", { name: "ADD TO CART" }).first().click();
  await page.getByRole("button", { name: "ADD TO CART" }).nth(2).click();
  await page.getByRole("link", { name: "Cart" }).click();
  await page
    .getByRole("heading", { name: "Hello Daphne You Have 5 total" })
    .click();
  await page.getByText("NUS T-shirt", { exact: true }).click();
  await page.getByText("Quantity:").first().click();
  await page.getByText("IoT").click();
  await page.getByText("Quantity:").nth(1).click();
  await page.getByText("Novel", { exact: true }).click();
  await page.getByText("Quantity: 1").click();
  await page.getByRole("button", { name: "Remove" }).first().click();
  await page.getByText("NUS T-shirt", { exact: true }).click();
  await page.getByText("Quantity:").first().click();
  await page.getByText("IoT").click();
  await page.getByText("Quantity: 2").click();
  await page.getByText("Novel", { exact: true }).click();
  await page.getByText("Quantity:").nth(2).click();
  await page
    .getByRole("heading", { name: "Hello Daphne You Have 4 total" })
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
    .fill("227");
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
  await page.getByRole("heading", { name: "All Orders" }).click();
  await page
    .getByText(
      "#StatusBuyer datePaymentQuantity20Not ProcessDaphnea few seconds agoSuccess3NUS"
    )
    .click();
});
