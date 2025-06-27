// Goal: Testing navigation, authentication, adding and removing items from cart, and checkout process in https://www.saucedemo.com

const { test, expect } = require('@playwright/test');

test('saucedemo.com test', async ({ page }) => {
  try {

    await test.step('Go to saucedemo.com', async () => {
        await page.goto('https://www.saucedemo.com');
        
try {
  await expect(page).toHaveURL('https://www.saucedemo.com');
} catch (err) {
  throw new Error("❌ Expected: HaveURL with 'https://www.saucedemo.com'\nActual: " + page + "\n" + err.message);
}
    });

    await test.step('Log in', async () => {
        await page.fill('[data-test="username"]', 'standard_user');
        await page.fill('[data-test="password"]', 'secret_sauce');
        await page.click('[data-test="login-button"]');
        
try {
  await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
} catch (err) {
  throw new Error("❌ Expected: HaveURL with 'https://www.saucedemo.com/inventory.html'\nActual: " + page + "\n" + err.message);
}
    });

    await test.step('Add items to the cart', async () => {
        await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
        await page.click('[data-test="add-to-cart-sauce-labs-bike-light"]');
        await page.click('[data-test="add-to-cart-sauce-labs-fleece-jacket"]');
        await expect(page.locator('[data-test="add-to-cart-sauce-labs-backpack"]')).toHaveCount(0);
        await expect(page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]')).toHaveCount(0);
        await expect(page.locator('[data-test="add-to-cart-sauce-labs-fleece-jacket"]')).toHaveCount(0);
    });

    await test.step('Remove an item from the cart', async () => {
        await page.click('[data-test="remove-sauce-labs-bike-light"]');
        await expect(page.locator('[data-test="remove-sauce-labs-bike-light"]')).toHaveCount(0);
    });

    await test.step('Proceed to checkout', async () => {
        await page.click('[data-test="shopping-cart-link"]');
        
try {
  await expect(page).toHaveURL('https://www.saucedemo.com/cart.html');
} catch (err) {
  throw new Error("❌ Expected: HaveURL with 'https://www.saucedemo.com/cart.html'\nActual: " + page + "\n" + err.message);
}
        await page.click('[data-test="checkout"]');
        
try {
  await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-one.html');
} catch (err) {
  throw new Error("❌ Expected: HaveURL with 'https://www.saucedemo.com/checkout-step-one.html'\nActual: " + page + "\n" + err.message);
}
    });

    await test.step('Filling in contact information', async () => {
        await page.fill('[data-test="firstName"]', 'John');
        await page.fill('[data-test="lastName"]', 'Doe');
        await page.fill('[data-test="postalCode"]', '90210');
        await page.click('[data-test="continue"]');
        
try {
  await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-two.html');
} catch (err) {
  throw new Error("❌ Expected: HaveURL with 'https://www.saucedemo.com/checkout-step-two.html'\nActual: " + page + "\n" + err.message);
}
    });

    await test.step('Finalizing order', async () => {
        await page.click('[data-test="finish"]');
        
try {
  await expect(page).toHaveURL('https://www.saucedemo.com/checkout-complete.html');
} catch (err) {
  throw new Error("❌ Expected: HaveURL with 'https://www.saucedemo.com/checkout-complete.html'\nActual: " + page + "\n" + err.message);
}
        await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
    });
  } catch (err) {
    const fs = require('fs');
    const path = require('path');
    const dir = path.join(__dirname, 'test-results', 'errors');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'testing-navigation-authentication-adding-and-removing-items-from-cart-and-checkout-process-in-httpswwwsaucedemocom.txt'), err.stack || err.message);
    throw err;
  }
});