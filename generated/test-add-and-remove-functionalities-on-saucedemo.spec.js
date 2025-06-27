const { test, expect } = require('@playwright/test');

test('Add and remove items from cart on saucedemo.com', async ({ page }) => {
  try {
  // Goal: Test add and remove functionalities on saucedemo

  await test.step('Navigate to saucedemo.com', async () => {
    await page.goto('https://www.saucedemo.com/');
    await expect(page.url()).toBe('https://www.saucedemo.com/');
  });

  await test.step('Logging in', async () => {
    await page.fill('[data-test="username"]', "standard_user");
    await page.fill('[data-test="password"]', "secret_sauce");
    await page.click('[data-test="login-button"]');
    
try {
  await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
} catch (err) {
  throw new Error("❌ Expected: HaveURL with 'https://www.saucedemo.com/inventory.html'\nActual: " + page + "\n" + err.message);
}
  });

  await test.step('Adding multiple items to the cart', async () => {
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('[data-test="add-to-cart-sauce-labs-bike-light"]');
    await page.click('[data-test="add-to-cart-sauce-labs-fleece-jacket"]');
    await page.click('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]');
    await page.click('[data-test="add-to-cart-sauce-labs-onesie"]');
    await page.click('[data-test="add-to-cart-test.allthethings()-t-shirt-(red)"]');
  });

  await test.step('Verifying added items in the cart', async () => {
    await page.click('[data-test="shopping-cart-link"]');
    await expect(page.locator('.cart_item')).toHaveCount(6);
  });

  await test.step('Removing items from the cart', async () => {
    await page.click('[data-test="remove-sauce-labs-backpack"]');
    await page.click('[data-test="remove-sauce-labs-bolt-t-shirt"]');
    await page.click('[data-test="remove-sauce-labs-onesie"]');
    await page.click('[data-test="remove-test.allthethings()-t-shirt-(red)"]');
  });

  await test.step('Verifying removed items from the cart', async () => {
    await expect(page.locator('.cart_item')).toHaveCount(2);
  });
  } catch (err) {
    const fs = require('fs');
    const path = require('path');
    const dir = path.join(__dirname, 'test-results', 'errors');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'test-add-and-remove-functionalities-on-saucedemo.txt'), err.stack || err.message);
    throw err;
  }
});