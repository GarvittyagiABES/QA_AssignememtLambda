'use strict';

const { test, expect } = require('@playwright/test');
const {
  searchAmazon,
  clickFirstProduct,
  extractPrice,
  addToCart,
} = require('./helpers/amazonHelper');

test('TC1 - Search iPhone, print price, and add to cart', async ({ page }) => {
  // ── Step 1: Search ────────────────────────────────────────────────
  await searchAmazon(page, 'iPhone');

  // ── Step 2: Open first product ────────────────────────────────────
  await clickFirstProduct(page);

  // ── Step 3: Capture and print the price ───────────────────────────
  const price = await extractPrice(page);
  console.log('\n========================================');
  console.log(`  [TC1] iPhone Price: ${price}`);
  console.log('========================================\n');

  expect(price).not.toBe('Price not found');

  // ── Step 4: Add to cart ───────────────────────────────────────────
  await addToCart(page);

  console.log('[TC1] iPhone successfully added to cart.');
});
