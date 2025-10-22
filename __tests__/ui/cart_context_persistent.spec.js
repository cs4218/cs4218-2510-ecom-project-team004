import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.getByRole("button", { name: "ADD TO CART" }).nth(1).click();
  await page.getByRole("listitem").filter({ hasText: "Cart1" }).click();
  await page
    .getByRole("heading", { name: "Hello Guest You Have 1 total" })
    .click();
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
  await page.getByRole("listitem").filter({ hasText: "Cart1" }).click();
  await page.getByRole("link", { name: "Home" }).click();
  await page.getByRole("button", { name: "ADD TO CART" }).nth(2).click();
  await page.getByRole("listitem").filter({ hasText: "Cart2" }).click();
  await page.getByRole("button", { name: "Daphne" }).click();
  await page.getByRole("link", { name: "Logout" }).click();
  await page.getByRole("listitem").filter({ hasText: "Cart0" }).click();
});
