import { chromium } from '@playwright/test';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '..', 'public', 'save-the-date');
const framesDir = join(publicDir, 'frames');

async function generateAssets() {
  // Create frames directory
  await fs.mkdir(framesDir, { recursive: true });
  
  console.log('Starting browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 600, height: 600 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();
  
  // Start dev server or use built version
  const baseUrl = 'http://localhost:3000';
  
  console.log('Navigating to save-the-date page...');
  await page.goto(`${baseUrl}/save-the-date`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.envelope', { state: 'visible' });
  await page.evaluate(() => document.fonts.ready);
  
  // Capture frame 1: sealed envelope
  console.log('Capturing sealed envelope...');
  await page.screenshot({ 
    path: join(framesDir, 'frame-00.png'),
    clip: { x: 0, y: 0, width: 600, height: 600 }
  });
  
  // Also save as static PNG
  await page.screenshot({ 
    path: join(publicDir, 'envelope-sealed.png'),
    clip: { x: 0, y: 0, width: 600, height: 600 }
  });
  console.log('Saved envelope-sealed.png');
  
  // Click to open and capture animation frames
  console.log('Capturing animation frames...');
  await page.click('.envelope-button');
  
  // Capture frames during animation (about 2 seconds, 20 fps = 40 frames)
  const frameDuration = 50; // ms between frames
  const totalFrames = 40;
  
  for (let i = 1; i <= totalFrames; i++) {
    await page.waitForTimeout(frameDuration);
    await page.screenshot({ 
      path: join(framesDir, `frame-${String(i).padStart(2, '0')}.png`),
      clip: { x: 0, y: 0, width: 600, height: 600 }
    });
  }
  
  console.log(`Captured ${totalFrames + 1} frames`);
  
  await browser.close();
  
  // Generate GIF using ffmpeg
  console.log('Generating animated GIF...');
  await new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-y', // overwrite
      '-framerate', '20',
      '-i', join(framesDir, 'frame-%02d.png'),
      '-vf', 'split[s0][s1];[s0]palettegen=max_colors=256[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3',
      '-loop', '1', // play once
      join(publicDir, 'save-the-date.gif')
    ]);
    
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        console.log('GIF generated successfully');
        resolve();
      } else {
        reject(new Error(`ffmpeg exited with code ${code}`));
      }
    });
    
    ffmpeg.on('error', reject);
  });
  
  // Clean up frames
  console.log('Cleaning up frames...');
  await fs.rm(framesDir, { recursive: true });
  
  // Get GIF stats
  const gifStats = await fs.stat(join(publicDir, 'save-the-date.gif'));
  const gifSizeMB = (gifStats.size / (1024 * 1024)).toFixed(2);
  
  console.log(`\n✓ Generated save-the-date.gif (${gifSizeMB} MB)`);
  console.log('✓ Generated envelope-sealed.png');
  console.log(`✓ Animation: ${totalFrames + 1} frames at 20 fps`);
  console.log('\nAssets ready in public/save-the-date/');
}

generateAssets().catch(console.error);
