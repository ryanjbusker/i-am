import { webkit, chromium } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

async function takeScreenshots() {
  // Try WebKit first, fall back to Chromium
  let browser;
  let browserType = 'webkit';
  
  try {
    browser = await webkit.launch({ headless: true });
  } catch (e) {
    console.log('WebKit not available, using Chromium...');
    browser = await chromium.launch({ headless: true });
    browserType = 'chromium';
  }
  
  console.log(`Using ${browserType} for screenshots`);
  
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();
  
  // Wait for fonts
  await page.goto(`${baseUrl}/save-the-date`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForSelector('.envelope-svg', { state: 'visible', timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1000);
  
  console.log('Taking closed envelope screenshot...');
  await page.screenshot({ 
    path: '/cursor/stores/self/std/std2-closed.png',
    fullPage: false
  });
  
  // Mid-open: wait for animation to be mid-way
  console.log('Taking mid-open screenshot...');
  await page.click('.envelope-button');
  await page.waitForTimeout(600); // Catch mid-animation
  await page.screenshot({ 
    path: '/cursor/stores/self/std/std2-mid.png',
    fullPage: false
  });
  
  // Wait for fully open
  console.log('Taking fully opened screenshot...');
  await page.waitForTimeout(1800); // Let animation complete
  await page.screenshot({ 
    path: '/cursor/stores/self/std/std2-open.png',
    fullPage: false
  });
  
  await context.close();
  
  // Now take screenshot with JS disabled
  console.log('Taking no-JS screenshot...');
  const noJsContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    javaScriptEnabled: false
  });
  const noJsPage = await noJsContext.newPage();
  
  await noJsPage.goto(`${baseUrl}/save-the-date`, { waitUntil: 'networkidle', timeout: 60000 });
  await noJsPage.waitForTimeout(1000);
  await noJsPage.screenshot({ 
    path: '/cursor/stores/self/std/std2-nojs.png',
    fullPage: false
  });
  
  await noJsContext.close();
  await browser.close();
  
  console.log('✓ All screenshots saved to /cursor/stores/self/std/');
}

takeScreenshots().catch(console.error);
