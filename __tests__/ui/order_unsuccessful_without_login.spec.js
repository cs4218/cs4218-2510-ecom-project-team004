import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.getByRole("button", { name: "ADD TO CART" }).nth(1).click();
  await page.getByRole("button", { name: "ADD TO CART" }).first().click();
  await page.getByTitle("2").click();
  await page.getByRole("link", { name: "Cart" }).click();
  await page
    .getByRole("heading", { name: "Hello Guest You Have 2 total" })
    .click();
  await page.getByText("NUS T-shirt", { exact: true }).click();
  await page.getByText("Price: 4.99").click();
  await page.getByText("Quantity:").first().click();
  await page.getByText("IoT").click();
  await page.getByText("Price: 10").click();
  await page.getByText("Quantity:").nth(1).click();
  await page.getByRole("button", { name: "Please Login to checkout" }).click();
  await page.getByRole("textbox", { name: "Enter Your Email" }).click();
  await page
    .getByRole("textbox", { name: "Enter Your Email" })
    .fill("shainemina51@gmail.com");
  await page.getByRole("textbox", { name: "Enter Your Password" }).click();
  await page
    .getByRole("textbox", { name: "Enter Your Password" })
    .fill("qwerty123");
  await page.getByRole("button", { name: "LOGIN" }).click();
  await page
    .getByRole("heading", { name: "Hello Daphne You Have 2 total" })
    .click();
  await page.getByRole("button", { name: "Make Payment" }).click();
  await page.getByRole("button", { name: "Paying with Card" }).click();
});
