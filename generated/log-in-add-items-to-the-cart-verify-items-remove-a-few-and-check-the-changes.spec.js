const { test, expect } = require('@playwright/test');

test('Test number 1', async ({ page }) => {
  try {
    // Ziel: Login, Artikel in den Warenkorb legen, Artikelanzahl prüfen,
    // einige Artikel entfernen und den Checkout-Prozess abschließen

    await test.step('Login to the test site', async () => {
      await page.goto('https://www.saucedemo.com');
      await page.fill('[data-test="username"]', 'standard_user');
      await page.fill('[data-test="password"]', 'secret_sauce');
      await page.click('[data-test="login-button"]');
      
      await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
    });

    await test.step('Add all items to the cart', async () => {
      await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
      await page.click('[data-test="add-to-cart-sauce-labs-bike-light"]');
      await page.click('[data-test="add-to-cart-sauce-labs-fleece-jacket"]');
      await page.click('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]');
      await page.click('[data-test="add-to-cart-sauce-labs-onesie"]');
      // Prüfen, dass das Warenkorb-Icon den Text '5' anzeigt (5 Artikel)
      await expect(page.locator('[data-test="shopping-cart-link"]')).toHaveText('5');
    });

    await test.step('Remove some items from the cart', async () => {
      // Erst in den Warenkorb gehen, sonst sind Remove-Buttons evtl. nicht sichtbar
      await page.click('[data-test="shopping-cart-link"]');
      await page.click('[data-test="remove-sauce-labs-backpack"]');
      await page.click('[data-test="remove-sauce-labs-bolt-t-shirt"]');
      await page.click('[data-test="remove-sauce-labs-onesie"]');
      // Prüfen, dass noch 2 Artikel im Warenkorb sind
      await expect(page.locator('[data-test="shopping-cart-link"]')).toHaveText('2');
    });

    await test.step('Checkout with remaining items', async () => {
      // Auf der Warenkorbseite bleiben und Checkout starten
      await page.click('[data-test="checkout"]');
      await page.fill('[data-test="firstName"]', 'John');
      await page.fill('[data-test="lastName"]', 'Doe');
      await page.fill('[data-test="postalCode"]', '12345');
      await page.click('[data-test="continue"]');

      await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-two.html');

      await page.click('[data-test="finish"]');

      await expect(page).toHaveURL('https://www.saucedemo.com/checkout-complete.html');
      await expect(page.locator('[data-test="checkout-complete-container"]')).toBeVisible();
      await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
      await expect(page.locator('[data-test="complete-text"]')).toHaveText('Your order has been dispatched, and will arrive just as fast as the pony can get there!');
    });

  } catch (err) {
    const fs = require('fs');
    const path = require('path');
    const dir = path.join(__dirname, 'test-results', 'errors');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'log-in-add-items-to-the-cart-verify-items-remove-a-few-and-check-the-changes.txt'), err.stack || err.message);
    throw err;
  }
});
