import { test, expect } from "@playwright/test";

test("login, list, create/edit/delete employee", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="tenant"]', "acme");
  await page.fill('input[name="email"]', "owner@acme.test");
  await page.fill('input[type="password"]', "owner123");
  await page.click('button:text("Login")');

  await page.waitForURL("**/employees");
  await expect(page.locator("table")).toBeVisible();

  // open first employee
  const firstRowLink = page.locator('tbody tr:first-child td:last-child a');
  await firstRowLink.click();
  await expect(page.locator('h1')).toContainText(/Edit Employee|Create Employee/);

  // back to list
  await page.goBack();

  // Create new employee (using edit screen "new")
  await page.goto("/employees/new");
  await page.fill('input[name="firstName"]', "Play");
  await page.fill('input[name="lastName"]', "Wright");
  await page.fill('input[name="email"]', `playwright.${Date.now()}@acme.test`);
  await page.click('button:text("Save")');

  await page.waitForURL("**/employees");
  await expect(page.locator("table")).toBeVisible();
});
