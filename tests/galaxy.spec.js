'use strict';

const { test, expect } = require('@playwright/test');
const {
  searchAmazon,
  clickFirstProduct,
  extractPrice,
  addToCart,
} = require('./helpers/amazonHelper');

test('TC2 - Search Samsung Galaxy, print price, and add to cart', async ({ page }) => {
  // ── Step 1: Search ────────────────────────────────────────────────
  await searchAmazon(page, 'Samsung Galaxy');

  // ── Step 2: Open first product ────────────────────────────────────
  await clickFirstProduct(page);

  // ── Step 3: Capture and print the price ───────────────────────────
  const price = await extractPrice(page);
  console.log('\n========================================');
  console.log(`  [TC2] Samsung Galaxy Price: ${price}`);
  console.log('========================================\n');

  expect(price).not.toBe('Price not found');

  // ── Step 4: Add to cart ───────────────────────────────────────────
  await addToCart(page);

  console.log('[TC2] Samsung Galaxy successfully added to cart.');
});
