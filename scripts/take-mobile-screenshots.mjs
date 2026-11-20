import { chromium } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

async function takeScreenshots() {
  const browser = await chromium.launch({ headless: true });
  
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();
  
  await page.goto(`${baseUrl}/save-the-date`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForSelector('.envelope-button', { state: 'visible', timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1000);
  
  console.log('Taking sealed envelope screenshot (mobile)...');
  await page.screenshot({ 
    path: '/cursor/stores/self/std/save-the-date-sealed-mobile.png',
    fullPage: false
  });
  
  await page.click('.envelope-button');
  await page.waitForTimeout(2500);
  
  console.log('Taking opened card screenshot (mobile)...');
  await page.screenshot({ 
    path: '/cursor/stores/self/std/save-the-date-opened-mobile.png',
    fullPage: false
  });
  
  await context.close();
  await browser.close();
  
  console.log('✓ Mobile screenshots saved');
}

takeScreenshots().catch(console.error);
