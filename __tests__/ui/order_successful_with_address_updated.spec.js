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
  await page.getByRole("button", { name: "ADD TO CART" }).first().click();
  await page.getByRole("button", { name: "ADD TO CART" }).nth(5).click();
  await page.getByRole("link", { name: "Cart" }).click();
  await page
    .getByRole("heading", { name: "Hello Daphne You Have 3 total" })
    .click();
  await page.getByText("NUS T-shirt", { exact: true }).click();
  await page.getByText("Price: 4.99").click();
  await page.getByText("Quantity:").first().click();
  await page.getByText("IoT").click();
  await page.getByText("Price: 10").click();
  await page.getByText("Quantity:").nth(1).click();
  await page.getByText("Laptop", { exact: true }).click();
  await page.getByText("Price: 1499.99").click();
  await page.getByText("Quantity:").nth(2).click();
  await page.getByRole("button", { name: "Update Address" }).click();
  await page.getByRole("textbox", { name: "Enter Your Address" }).click();
  await page.getByRole("textbox", { name: "Enter Your Address" }).fill("");
  await page
    .getByRole("textbox", { name: "Enter Your Address" })
    .press("CapsLock");
  await page.getByRole("textbox", { name: "Enter Your Address" }).fill("W");
  await page
    .getByRole("textbox", { name: "Enter Your Address" })
    .press("CapsLock");
  await page
    .getByRole("textbox", { name: "Enter Your Address" })
    .fill("Westcoast");
  await page.getByRole("button", { name: "UPDATE" }).click();
  await page.getByRole("link", { name: "Home" }).click();
  await page.getByRole("link", { name: "Cart" }).click();
  await page.getByRole("heading", { name: "Westcoast" }).click();
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
    .fill("1125");
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
});
