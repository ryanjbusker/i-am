import { chromium } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

async function debugPage() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  // Listen for console messages
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error));
  
  console.log('Navigating to save-the-date...');
  await page.goto(`${baseUrl}/save-the-date`, { waitUntil: 'networkidle', timeout: 60000 });
  
  await page.waitForTimeout(5000);
  
  console.log('\n=== PAGE CONTENT ===');
  const content = await page.content();
  console.log(content.slice(0, 2000)); // First 2000 chars
  
  console.log('\n=== BODY TEXT ===');
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log(bodyText);
  
  console.log('\n=== CHECKING SELECTORS ===');
  const envelopeButton = await page.$('.envelope-button');
  console.log('.envelope-button found:', !!envelopeButton);
  
  const saveTheDateContainer = await page.$('.save-the-date-container');
  console.log('.save-the-date-container found:', !!saveTheDateContainer);
  
  await browser.close();
}

debugPage().catch(console.error);
