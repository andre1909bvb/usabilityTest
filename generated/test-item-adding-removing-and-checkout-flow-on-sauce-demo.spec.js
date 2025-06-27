const { test, expect } = require('@playwright/test');

test('Test Number 1', async ({ page }) => {
  try {
    // Goal: Test item adding, removing, and checkout flow on Sauce Demo
    await page.goto('https://www.saucedemo.com');

    await test.step('Log in', async () => {
      await page.fill('[data-test="username"]', 'standard_user');
      await page.fill('[data-test="password"]', 'secret_sauce');
      await page.click('[data-test="login-button"]');

      try {
        await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
      } catch (err) {
        throw new Error("❌ Expected: HaveURL with 'https://www.saucedemo.com/inventory.html'\nActual: " + page.url() + "\n" + err.message);
      }
    });

    await test.step('Add items to the cart', async () => {
      await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
      await page.click('[data-test="add-to-cart-sauce-labs-bike-light"]');
      await page.click('[data-test="add-to-cart-sauce-labs-fleece-jacket"]');
      await expect(page.locator('[data-test^="remove-"]')).toHaveCount(3);
    });

    await test.step('Removing items from the cart', async () => {
      await page.click('[data-test="shopping-cart-link"]');
      await page.click('[data-test="remove-sauce-labs-backpack"]');
      await page.click('[data-test="remove-sauce-labs-bike-light"]');
      // Korrigierte Anzahl: Nur 1 Artikel bleibt im Warenkorb
      await expect(page.locator('[data-test^="remove-"]')).toHaveCount(1);
    });

    await test.step('Checking out', async () => {
      await page.click('[data-test="checkout"]');
      await page.fill('[data-test="firstName"]', 'John');
      await page.fill('[data-test="lastName"]', 'Doe');
      await page.fill('[data-test="postalCode"]', '123456');
      await page.click('[data-test="continue"]');

      try {
        await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-two.html');
      } catch (err) {
        throw new Error("❌ Expected: HaveURL with 'https://www.saucedemo.com/checkout-step-two.html'\nActual: " + page.url() + "\n" + err.message);
      }

      await page.click('[data-test="finish"]');

      try {
        await expect(page).toHaveURL('https://www.saucedemo.com/checkout-complete.html');
      } catch (err) {
        throw new Error("❌ Expected: HaveURL with 'https://www.saucedemo.com/checkout-complete.html'\nActual: " + page.url() + "\n" + err.message);
      }
    });

    await test.step('Verify checkout successful', async () => {
      await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
      await expect(page.locator('[data-test="complete-text"]')).toHaveText('Your order has been dispatched, and will arrive just as fast as the pony can get there!');
    });
  } catch (err) {
    const fs = require('fs');
    const path = require('path');
    const dir = path.join(__dirname, 'test-results', 'errors');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'test-item-adding-removing-and-checkout-flow-on-sauce-demo.txt'), err.stack || err.message);
    throw err;
  }
});
