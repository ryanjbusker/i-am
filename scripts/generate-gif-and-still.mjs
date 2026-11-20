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
  await fs.mkdir(framesDir, { recursive: true });
  
  console.log('Starting browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 600, height: 600 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();
  
  const baseUrl = 'http://localhost:3000';
  
  console.log('Navigating to save-the-date page...');
  await page.goto(`${baseUrl}/save-the-date`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.envelope-wrapper', { state: 'visible', timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1000);
  
  // Capture sealed envelope at high quality for cropping
  console.log('Capturing sealed envelope...');
  const envelopeElement = await page.$('.envelope-wrapper');
  const boundingBox = await envelopeElement.boundingBox();
  
  // Take full sealed envelope screenshot for cropping
  await page.screenshot({ 
    path: join(framesDir, 'temp-sealed.png'),
    clip: {
      x: Math.max(0, boundingBox.x - 40),
      y: Math.max(0, boundingBox.y - 40),
      width: Math.min(600, boundingBox.width + 80),
      height: Math.min(600, boundingBox.height + 80)
    }
  });
  
  // Resize to 600px width for email
  await new Promise((resolve, reject) => {
    const convert = spawn('ffmpeg', [
      '-y',
      '-i', join(framesDir, 'temp-sealed.png'),
      '-vf', 'scale=600:-1',
      join(publicDir, 'save-the-date-sealed.png')
    ]);
    convert.on('close', (code) => code === 0 ? resolve() : reject(new Error(`ffmpeg resize failed: ${code}`)));
    convert.on('error', reject);
  });
  console.log('✓ Created save-the-date-sealed.png');
  
  // Capture frame 1: sealed envelope for GIF
  await page.screenshot({ 
    path: join(framesDir, 'frame-00.png'),
    clip: { x: 0, y: 0, width: 600, height: 600 }
  });
  
  // Click to open and capture animation frames
  console.log('Capturing animation frames...');
  await page.click('.envelope-button');
  
  // Capture frames during animation at 12 fps for 2.5 seconds = 30 frames
  const frameDuration = 83; // ~12 fps
  const animationFrames = 30;
  
  for (let i = 1; i <= animationFrames; i++) {
    await page.waitForTimeout(frameDuration);
    await page.screenshot({ 
      path: join(framesDir, `frame-${String(i).padStart(2, '0')}.png`),
      clip: { x: 0, y: 0, width: 600, height: 600 }
    });
  }
  
  // Add extra frames at the end to hold on the final card (5 more frames = ~0.4s hold)
  for (let i = animationFrames + 1; i <= animationFrames + 5; i++) {
    await fs.copyFile(
      join(framesDir, `frame-${String(animationFrames).padStart(2, '0')}.png`),
      join(framesDir, `frame-${String(i).padStart(2, '0')}.png`)
    );
  }
  
  const totalFrames = animationFrames + 6; // +1 for frame-00, +5 hold frames
  console.log(`Captured ${totalFrames} frames`);
  
  await browser.close();
  
  // Generate GIF using ffmpeg with palette for better compression
  console.log('Generating animated GIF...');
  await new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-y',
      '-framerate', '12',
      '-i', join(framesDir, 'frame-%02d.png'),
      '-vf', 'split[s0][s1];[s0]palettegen=max_colors=96:stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=2',
      '-loop', '0', // loop count 0 in GIF = play once
      join(publicDir, 'save-the-date.gif')
    ]);
    
    ffmpeg.stderr.on('data', (data) => {
      // Silent stderr unless error
    });
    
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        console.log('✓ GIF generated successfully');
        resolve();
      } else {
        reject(new Error(`ffmpeg exited with code ${code}`));
      }
    });
    
    ffmpeg.on('error', reject);
  });
  
  // Clean up frames and temp
  console.log('Cleaning up...');
  await fs.rm(framesDir, { recursive: true });
  
  // Get GIF stats
  const gifStats = await fs.stat(join(publicDir, 'save-the-date.gif'));
  const gifSizeMB = (gifStats.size / (1024 * 1024)).toFixed(2);
  const gifSizeKB = (gifStats.size / 1024).toFixed(0);
  
  const stillStats = await fs.stat(join(publicDir, 'save-the-date-sealed.png'));
  const stillSizeKB = (stillStats.size / 1024).toFixed(0);
  
  console.log(`\n✅ Generated save-the-date.gif (${gifSizeKB} KB / ${gifSizeMB} MB)`);
  console.log(`✅ Generated save-the-date-sealed.png (${stillSizeKB} KB)`);
  console.log(`✅ Animation: ${totalFrames} frames at 12 fps, loop count 1`);
  console.log('\nAssets ready in public/save-the-date/');
}

generateAssets().catch(console.error);
