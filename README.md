# Amazon Playwright Tests

Automated test suite for Amazon.com built with **Playwright + JavaScript**.

| Test | Description |
|------|-------------|
| TC1  | Search "iPhone" → open first result → print price → add to cart |
| TC2  | Search "Samsung Galaxy" → open first result → print price → add to cart |

Both tests run **in parallel** (2 workers).

---

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js     | 18 or higher |
| npm         | bundled with Node.js |

Download Node.js: https://nodejs.org

---

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/amazon-playwright-tests.git
cd amazon-playwright-tests

# 2. Install dependencies
npm install

# 3. Install Playwright browsers (only needed once)
npx playwright install chromium
```

---

## Running Locally

### Headless mode (default — no browser window)
```bash
npm test
```

### Headed mode (watch the browser)
```bash
npm run test:headed
```

### View HTML report after the run
```bash
npm run report
```

**Console output example:**
```
========================================
  [TC1] iPhone Price: $829.00
========================================

[TC1] iPhone successfully added to cart.

========================================
  [TC2] Samsung Galaxy Price: $699.99
========================================

[TC2] Samsung Galaxy successfully added to cart.
```

> TC1 and TC2 run simultaneously in two separate browser windows.

---

## Running on LambdaTest Cloud (Bonus)

### Step 1 — Sign up
Create a free account at https://www.lambdatest.com

### Step 2 — Get credentials
Go to **Profile → Account Settings → Password & Security** and copy your  
**Username** and **Access Key**.

### Step 3 — Set environment variables

**macOS / Linux:**
```bash
export LT_USERNAME="your_username"
export LT_ACCESS_KEY="your_access_key"
```

**Windows (Command Prompt):**
```cmd
set LT_USERNAME=your_username
set LT_ACCESS_KEY=your_access_key
```

**Windows (PowerShell):**
```powershell
$env:LT_USERNAME = "your_username"
$env:LT_ACCESS_KEY = "your_access_key"
```

### Step 4 — Run on the cloud
```bash
npm run test:lambdatest
```

Results appear live in your LambdaTest dashboard under **Web Automation**.

---

## Project Structure

```
amazon-playwright-tests/
├── tests/
│   ├── iphone.spec.js          # TC1 — iPhone test
│   ├── galaxy.spec.js          # TC2 — Galaxy test
│   └── helpers/
│       └── amazonHelper.js     # Shared page-object helpers
├── playwright.config.js        # Local config (2 parallel workers)
├── lambdatest.config.js        # LambdaTest cloud config
├── package.json
├── .env.example                # Environment variable template
└── README.md
```

---

## How Parallel Execution Works

`playwright.config.js` sets:
```js
fullyParallel: true,
workers: 2,
```

Playwright spawns two separate browser processes simultaneously — one runs `iphone.spec.js` and the other runs `galaxy.spec.js`. They share no state.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Add to Cart` button not found | Amazon requires variant selection (storage/color) — the helper tries to pick the first available option automatically |
| Tests time out on first load | Amazon geo-detects visitors; try running headed (`npm run test:headed`) to see what's blocking |
| Price shows `Price not found` | Product may be out-of-stock or Prime-exclusive; the test will still add to cart if the button is present |
| LambdaTest: `LT_USERNAME not set` | Make sure you exported the env variables in the **same terminal session** before running |
| CAPTCHA appears | Amazon's bot detection triggered — wait a few minutes and retry, or use a residential IP |
