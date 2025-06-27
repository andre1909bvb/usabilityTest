const { test, expect } = require('@playwright/test');

// Goal: Login with valid credentials, add items to cart, remove them and verify cart actions correctly

test('Test #1', async ({ page }) => {
  try {

  await test.step('Navigate to the saucedemo home', async () => {
    await page.goto('https://www.saucedemo.com');
    
try {
  await expect(page).toHaveURL('https://www.saucedemo.com');
} catch (err) {
  throw new Error("❌ Expected: HaveURL with 'https://www.saucedemo.com'\nActual: " + page + "\n" + err.message);
}
  });

  await test.step('Login with credentials', async () => {
    await page.fill('[data-test="username"]', "standard_user");
    await page.fill('[data-test="password"]', "secret_sauce");
    await page.click('[data-test="login-button"]');
    
try {
  await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
} catch (err) {
  throw new Error("❌ Expected: HaveURL with 'https://www.saucedemo.com/inventory.html'\nActual: " + page + "\n" + err.message);
}
  });

  await test.step('Add items to cart', async () => {
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('[data-test="add-to-cart-sauce-labs-bike-light"]');
    await page.click('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]');
    await expect(page.locator('[data-test="shopping-cart-link"]')).toHaveText('3');

  });

  await test.step('Remove items from cart', async () => {
    await page.click('[data-test="shopping-cart-link"]');
    await page.click('[data-test="remove-sauce-labs-backpack"]');
    await page.click('[data-test="remove-sauce-labs-bolt-t-shirt"]');
    await expect(page.locator('[data-test="shopping-cart-link"]')).toHaveCount(1);
  });

  await test.step('Navigate to the home and verify items in the cart', async () => {
    const button = page.locator('[data-test="continue-shopping"]');
    await button.click();
    
    
    
try {
  await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
} catch (err) {
  throw new Error("❌ Expected: HaveURL with 'https://www.saucedemo.com/inventory.html'\nActual: " + page + "\n" + err.message);
}
    await expect(page.locator('[data-test="shopping-cart-link"]')).toHaveCount(1);
  });
  } catch (err) {
    const fs = require('fs');
    const path = require('path');
    const dir = path.join(__dirname, 'test-results', 'errors');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'login-with-valid-credentials-add-items-to-cart-remove-them-and-verify-cart-actions-correctly.txt'), err.stack || err.message);
    throw err;
  }
});