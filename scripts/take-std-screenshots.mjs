import { chromium } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

async function takeScreenshots() {
  console.log('Starting browser...');
  const browser = await chromium.launch({ headless: true });
  
  // Desktop screenshots
  const desktopContext = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const desktopPage = await desktopContext.newPage();
  
  console.log('Navigating to save-the-date...');
  await desktopPage.goto(`${baseUrl}/save-the-date`, { waitUntil: 'networkidle', timeout: 60000 });
  
  console.log('Waiting for envelope to render...');
  await desktopPage.waitForSelector('.envelope-button', { state: 'visible', timeout: 60000 });
  await desktopPage.evaluate(() => document.fonts.ready);
  await desktopPage.waitForTimeout(1000);
  
  console.log('Taking sealed envelope screenshot (desktop)...');
  await desktopPage.screenshot({ 
    path: '/cursor/stores/self/std/save-the-date-sealed-desktop.png',
    fullPage: false
  });
  
  console.log('Opening envelope...');
  await desktopPage.click('.envelope-button');
  await desktopPage.waitForTimeout(2500);
  
  console.log('Taking opened card screenshot (desktop)...');
  await desktopPage.screenshot({ 
    path: '/cursor/stores/self/std/save-the-date-opened-desktop.png',
    fullPage: false
  });
  
  await desktopContext.close();
  
  // Mobile screenshots
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2
  });
  const mobilePage = await mobileContext.newPage();
  
  console.log('Navigating to save-the-date (mobile)...');
  await mobilePage.goto(`${baseUrl}/save-the-date`, { waitUntil: 'networkidle', timeout: 60000 });
  
  console.log('Waiting for envelope to render (mobile)...');
  await mobilePage.waitForSelector('.envelope-button', { state: 'visible', timeout: 60000 });
  await mobilePage.evaluate(() => document.fonts.ready);
  await mobilePage.waitForTimeout(1000);
  
  console.log('Taking sealed envelope screenshot (mobile)...');
  await mobilePage.screenshot({ 
    path: '/cursor/stores/self/std/save-the-date-sealed-mobile.png',
    fullPage: false
  });
  
  console.log('Opening envelope (mobile)...');
  await mobilePage.click('.envelope-button');
  await mobilePage.waitForTimeout(2500);
  
  console.log('Taking opened card screenshot (mobile)...');
  await mobilePage.screenshot({ 
    path: '/cursor/stores/self/std/save-the-date-opened-mobile.png',
    fullPage: false
  });
  
  await mobileContext.close();
  await browser.close();
  
  console.log('\n✓ Screenshots saved to /cursor/stores/self/std/');
}

takeScreenshots().catch(console.error);
