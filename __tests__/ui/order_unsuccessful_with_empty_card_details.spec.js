import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Enter Your Email" }).fill("sh");
  await page.getByRole("textbox", { name: "Enter Your Email" }).click();
  await page
    .getByRole("textbox", { name: "Enter Your Email" })
    .fill("shainemina51@gmail.com");
  await page.getByRole("textbox", { name: "Enter Your Password" }).click();
  await page
    .getByRole("textbox", { name: "Enter Your Password" })
    .fill("qwerty123");
  await page.getByRole("button", { name: "LOGIN" }).click();
  await page.getByRole("button", { name: "More Details" }).nth(1).click();
  await page.getByRole("heading", { name: "Name : NUS T-shirt" }).click();
  await page.getByRole("button", { name: "ADD TO CART" }).click();
  await page.getByRole("link", { name: "Cart" }).click();
  await page
    .getByRole("heading", { name: "Hello Daphne You Have 1 total" })
    .click();
  await page.getByRole("heading", { name: "Current Address" }).click();
  await page.getByRole("heading", { name: "Westcoast" }).click();
  await page.getByRole("button", { name: "Paying with Card" }).click();
  await page
    .locator('iframe[name="braintree-hosted-field-expirationDate"]')
    .contentFrame()
    .getByRole("textbox", { name: "Expiration Date" })
    .click();
  await page.getByText("Please fill out a card number.").click();
  await page
    .locator('iframe[name="braintree-hosted-field-cvv"]')
    .contentFrame()
    .getByRole("textbox", { name: "CVV" })
    .click();
  await page
    .locator('iframe[name="braintree-hosted-field-expirationDate"]')
    .contentFrame()
    .getByRole("textbox", { name: "Expiration Date" })
    .click();
  await page
    .locator('iframe[name="braintree-hosted-field-number"]')
    .contentFrame()
    .getByRole("textbox", { name: "Credit Card Number" })
    .click();
  await page.getByText("Please fill out an expiration").click();
  await page.getByText("Please fill out a CVV.").click();
  await page.getByRole("button", { name: "Make Payment" }).click();
  await page.getByText("Please check your information").click();
});
