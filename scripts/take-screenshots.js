const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Helper function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, '../screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function takeScreenshots() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
      width: 1920,
      height: 1080
    }
  });

  const page = await browser.newPage();

  try {
    console.log('📸 Starting screenshot capture...');

    // First, login to access protected pages
    console.log('0. Logging in...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
    const loginInputs = await page.$$('input');
    if (loginInputs.length >= 2) {
      await loginInputs[0].type('lucianfialho');
      await loginInputs[1].type('fuulejo22');
    }
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const signInButton = buttons.find(btn => btn.textContent.includes('Sign In'));
      if (signInButton) signInButton.click();
    });
    await wait(2000); // Wait for login to complete
    console.log('✓ Logged in successfully');

    // 1. Setup Page (Step 1) - capture without login
    console.log('1. Navigating to setup page...');
    await page.goto('http://localhost:3000/setup', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(screenshotsDir, '01-setup-intro.png'), fullPage: true });
    console.log('✓ Setup intro captured');

    // Click next to go to step 2
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const nextButton = buttons.find(btn => btn.textContent.includes('Next'));
      if (nextButton) nextButton.click();
    });
    await wait(500);
    await page.screenshot({ path: path.join(screenshotsDir, '02-setup-symbols.png'), fullPage: true });
    console.log('✓ Setup symbols captured');

    // Click next to go to step 3
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const nextButton = buttons.find(btn => btn.textContent.includes('Next'));
      if (nextButton) nextButton.click();
    });
    await wait(500);
    await page.screenshot({ path: path.join(screenshotsDir, '03-setup-account.png'), fullPage: true });
    console.log('✓ Setup account captured');

    // 2. Daily View
    console.log('2. Navigating to daily view...');
    await page.goto('http://localhost:3000/daily', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(screenshotsDir, '05-daily-view.png'), fullPage: true });
    console.log('✓ Daily view captured');

    // 3. Weekly View
    console.log('3. Navigating to weekly view...');
    await page.goto('http://localhost:3000/weekly', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(screenshotsDir, '06-weekly-view.png'), fullPage: true });
    console.log('✓ Weekly view captured');

    // 4. Monthly View
    console.log('4. Navigating to monthly view...');
    await page.goto('http://localhost:3000/monthly', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(screenshotsDir, '07-monthly-view.png'), fullPage: true });
    console.log('✓ Monthly view captured');

    // 5. Collections
    console.log('5. Navigating to collections...');
    await page.goto('http://localhost:3000/collections', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(screenshotsDir, '08-collections.png'), fullPage: true });
    console.log('✓ Collections captured');

    // 6. Dashboard
    console.log('6. Navigating to dashboard...');
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(screenshotsDir, '09-dashboard.png'), fullPage: true });
    console.log('✓ Dashboard captured');

    console.log('\n✅ All screenshots captured successfully!');
    console.log(`📁 Screenshots saved in: ${screenshotsDir}`);

  } catch (error) {
    console.error('❌ Error taking screenshots:', error);
  } finally {
    await browser.close();
  }
}

takeScreenshots();
