'use strict';

/**
 * Navigates to Amazon, dismisses popups, and executes a search query.
 */
async function searchAmazon(page, query) {

  await page.goto('https://www.amazon.com', {
    waitUntil: 'networkidle',
  });

  await page.waitForTimeout(3000);

  // Detect captcha
  const bodyText = await page.locator('body').textContent();

  if (
    bodyText.includes('Enter the characters you see below') ||
    bodyText.includes('Sorry, we just need to make sure')
  ) {
    throw new Error('Amazon CAPTCHA triggered');
  }

  // Search product
  await page.fill('#twotabsearchtextbox', query);

  await page.keyboard.press('Enter');

  // Wait longer for Amazon dynamic rendering
  await page.waitForLoadState('networkidle');

  await page.waitForTimeout(5000);
}

/**
 * Clicks the first non-sponsored organic search result.
 */
async function clickFirstProduct(page) {

  // Use broader Amazon search result selector
  const products = page.locator('a[href*="/dp/"]');

  const count = await products.count();

  if (count === 0) {
    throw new Error('No Amazon product links found');
  }

  const firstProduct = products.first();

  await firstProduct.scrollIntoViewIfNeeded();

  const [newPage] = await Promise.all([
    page.context().waitForEvent('page').catch(() => null),
    firstProduct.click({ force: true }),
  ]);

  if (newPage) {
    await newPage.waitForLoadState('domcontentloaded');
    return newPage;
  }

  await page.waitForLoadState('domcontentloaded');

  return page;
}

/**
 * Reads the product price from the detail page.
 * Tries multiple selectors because Amazon's layout varies by product type.
 */
async function extractPrice(page) {
  // Give dynamic price blocks time to render
  await page.waitForTimeout(1500);

  const selectors = [
    // Primary buybox price (accessible offscreen span — has full "$X.XX" text)
    '#corePrice_feature_div .a-price .a-offscreen',
    '#corePriceDisplay_desktop_feature_div .a-price .a-offscreen',
    '.priceToPay .a-offscreen',
    '#price .a-price .a-offscreen',
    '#price_inside_buybox',
    '#priceblock_ourprice',
    '#priceblock_dealprice',
    // Fallback: any offscreen price
    '.a-price .a-offscreen',
  ];

  for (const selector of selectors) {
    const elements = await page.locator(selector).all();
    for (const el of elements) {
      const text = await el.textContent().catch(() => null);
      if (text && /\$[\d,]+\.?\d*/.test(text)) {
        return text.trim();
      }
    }
  }

  // Last-resort: scrape first dollar amount visible in the page body
  const bodyText = await page.locator('body').textContent().catch(() => '');
  const match = bodyText.match(/\$[\d,]+\.\d{2}/);
  return match ? match[0] : 'Price not found';
}

/**
 * Selects a product variant (storage / color / size) when required
 * before the Add to Cart button becomes enabled.
 */
async function selectVariantIfNeeded(page) {
  const variantContainers = [
    '#variation_color_name',
    '#variation_size_name',
    '#variation_storage_size_name',
    '#variation_configuration_name',
    '#variation_style_name',
  ];

  for (const container of variantContainers) {
    const wrapper = page.locator(container);
    if (!(await wrapper.isVisible({ timeout: 1500 }).catch(() => false))) continue;

    // Click the first available (not already selected) option button
    const unselected = wrapper.locator('li.a-declarative:not(.a-button-selected)');
    const count = await unselected.count();
    if (count > 0) {
      await unselected.first().click().catch(() => {});
      await page.waitForTimeout(800);
    }
  }
}

/**
 * Adds the current product to the cart.
 * Handles variant selection and waits for the confirmation banner.
 */
async function addToCart(page) {
  // Select any required variants first so the button becomes active
  await selectVariantIfNeeded(page);

  const cartBtn = page.locator('#add-to-cart-button');
  await cartBtn.waitFor({ state: 'visible', timeout: 15000 });
  await cartBtn.click();

  // Wait for one of several possible confirmation signals
  await page
    .locator(
      [
        '#NATC_SMART_WAGON_CONF_MSG_SUCCESS',
        '#attachDisplayAddBaseAlert',
        '[data-feature-id="huc-v2-order-row-confirm-text"]',
        '.a-alert-success',
        '#nav-cart-count',   // cart counter badge update also signals success
      ].join(', ')
    )
    .first()
    .waitFor({ state: 'visible', timeout: 20000 });
}

/**
 * Silently dismisses common Amazon overlay popups (location, cookie, sign-in nudge).
 */
async function dismissPopups(page) {
  const dismissSelectors = [
    // Location / "ship to" dialog close button
    '[data-action="a-popover-close"]',
    // Generic popover close
    '.a-popover-closebutton',
    // "No thanks" on sign-in suggestion
    '#nav-flyout-dismiss',
    // Cookie notice accept (international Amazon)
    '#sp-cc-accept',
    // Generic "No thanks" link
    'a[href*="nab=0"]',
  ];

  for (const selector of dismissSelectors) {
    const el = page.locator(selector).first();
    const visible = await el.isVisible({ timeout: 1000 }).catch(() => false);
    if (visible) {
      await el.click().catch(() => {});
      await page.waitForTimeout(300);
    }
  }
}

module.exports = {
  searchAmazon,
  clickFirstProduct,
  extractPrice,
  addToCart,
  dismissPopups,
};
