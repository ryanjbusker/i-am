/**
 * GIF Generation Script (Reference Only)
 * 
 * NOTE: The committed save-the-date.gif in public/save-the-date/ is the FINAL ASSET
 * and should not be regenerated or overwritten. This script is kept for reference
 * to document the animation approach used during development.
 * 
 * The final GIF was hand-crafted at 600×600px, ~1.16MB, plays once with a 15s hold.
 */

import { chromium } from '@playwright/test';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '..', 'public', 'save-the-date');
const framesDir = join(publicDir, 'frames');

// Exit early to prevent overwriting the final asset
console.log('⚠️  This script is for reference only.');
console.log('⚠️  The committed GIF is the final asset and should not be regenerated.');
console.log('⚠️  Exiting to prevent overwriting.');
process.exit(0);

async function generateAssets() {
  await fs.mkdir(framesDir, { recursive: true });
  
  console.log('Starting browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 600, height: 600 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();
  
  const baseUrl = 'http://localhost:3000';
  
  console.log('Navigating to save-the-date page...');
  await page.goto(`${baseUrl}/save-the-date`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.envelope-wrapper', { state: 'visible', timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1000);
  
  // Hide the button before capturing
  await page.evaluate(() => {
    const button = document.querySelector('.action-button-container');
    if (button) button.style.display = 'none';
  });
  
  let frameNum = 0;
  const delays = [];
  
  // Phase 1: Sealed envelope (hold for 0.6s = 7 frames at ~12fps)
  console.log('Capturing sealed envelope frames...');
  for (let i = 0; i < 7; i++) {
    await page.screenshot({ 
      path: join(framesDir, `frame-${String(frameNum).padStart(3, '0')}.png`),
      clip: { x: 0, y: 0, width: 600, height: 600 }
    });
    delays.push(83); // ~12 fps
    frameNum++;
  }
  
  // Phase 2: Flap opening (0.8s = 10 frames)
  console.log('Capturing flap opening...');
  await page.click('.envelope-button');
  
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(80); // 0.8s / 10 = 80ms per frame
    await page.screenshot({ 
      path: join(framesDir, `frame-${String(frameNum).padStart(3, '0')}.png`),
      clip: { x: 0, y: 0, width: 600, height: 600 }
    });
    delays.push(83);
    frameNum++;
  }
  
  // Phase 3: Card rising (1.2s = 14 frames)
  console.log('Capturing card rising...');
  for (let i = 0; i < 14; i++) {
    await page.waitForTimeout(86); // 1.2s / 14 = ~86ms per frame
    await page.screenshot({ 
      path: join(framesDir, `frame-${String(frameNum).padStart(3, '0')}.png`),
      clip: { x: 0, y: 0, width: 600, height: 600 }
    });
    delays.push(83);
    frameNum++;
  }
  
  // Final frame with long hold (10 seconds)
  await page.waitForTimeout(500);
  await page.screenshot({ 
    path: join(framesDir, `frame-${String(frameNum).padStart(3, '0')}.png`),
    clip: { x: 0, y: 0, width: 600, height: 600 }
  });
  delays.push(10000); // 10 second hold
  frameNum++;
  
  const totalFrames = frameNum;
  console.log(`Captured ${totalFrames} frames`);
  
  // Extract specific frames for verification
  await fs.copyFile(
    join(framesDir, 'frame-000.png'),
    join(publicDir, 'gif-frame-001-sealed.png')
  );
  await fs.copyFile(
    join(framesDir, 'frame-015.png'),
    join(publicDir, 'gif-frame-mid.png')
  );
  await fs.copyFile(
    join(framesDir, `frame-${String(totalFrames - 1).padStart(3, '0')}.png`),
    join(publicDir, 'gif-frame-final.png')
  );
  console.log('✓ Extracted verification frames');
  
  // Create sealed envelope PNG (tightly cropped)
  const envelopeBox = await (await page.$('.envelope')).boundingBox();
  const tempSealed = join(framesDir, 'temp-sealed.png');
  await page.goto(`${baseUrl}/save-the-date`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.envelope-wrapper', { state: 'visible' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  
  await page.screenshot({ 
    path: tempSealed,
    clip: {
      x: Math.max(0, envelopeBox.x - 20),
      y: Math.max(0, envelopeBox.y - 20),
      width: Math.min(600, envelopeBox.width + 40),
      height: Math.min(600, envelopeBox.height + 40)
    }
  });
  
  await sharp(tempSealed)
    .resize(600, null, { fit: 'inside' })
    .toFile(join(publicDir, 'save-the-date-sealed.png'));
  console.log('✓ Created save-the-date-sealed.png');
  
  await browser.close();
  
  // Generate GIF with variable frame delays
  console.log('Generating animated GIF with ffmpeg...');
  
  // Create concat file with delays
  const concatContent = delays.map((delay, i) => 
    `file 'frames/frame-${String(i).padStart(3, '0')}.png'\nduration ${delay / 1000}`
  ).join('\n') + `\nfile 'frames/frame-${String(totalFrames - 1).padStart(3, '0')}.png'`; // Last frame needs to be repeated
  
  await fs.writeFile(join(publicDir, 'concat.txt'), concatContent);
  
  // Generate with ffmpeg using concat demuxer for variable timing
  await new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-y',
      '-f', 'concat',
      '-safe', '0',
      '-i', join(publicDir, 'concat.txt'),
      '-vf', 'scale=600:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=96:stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=2',
      '-loop', '-1', // No loop (play once)
      join(publicDir, 'save-the-date.gif')
    ]);
    
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        console.log('✓ GIF generated');
        resolve();
      } else {
        reject(new Error(`ffmpeg failed: ${code}`));
      }
    });
    ffmpeg.on('error', reject);
  });
  
  // Clean up
  await fs.rm(framesDir, { recursive: true });
  await fs.unlink(join(publicDir, 'concat.txt'));
  await fs.unlink(tempSealed).catch(() => {});
  
  // Verify GIF
  const gifStats = await fs.stat(join(publicDir, 'save-the-date.gif'));
  const sizeKB = (gifStats.size / 1024).toFixed(0);
  const sizeMB = (gifStats.size / (1024 * 1024)).toFixed(2);
  
  console.log(`\n✅ save-the-date.gif: ${sizeKB} KB (${sizeMB} MB)`);
  console.log(`✅ Frames: ${totalFrames} (7 sealed, 10 flap, 14 card, 1 hold)`);
  console.log(`✅ Loop: -1 (plays once)`);
  console.log(`✅ Final frame hold: 10 seconds`);
  
  // Get sealed PNG size
  const sealedStats = await fs.stat(join(publicDir, 'save-the-date-sealed.png'));
  console.log(`✅ save-the-date-sealed.png: ${(sealedStats.size / 1024).toFixed(0)} KB`);
  
  console.log('\n✅ Verification frames extracted:');
  console.log('  - gif-frame-001-sealed.png (frame 1)');
  console.log('  - gif-frame-mid.png (frame 16)');
  console.log('  - gif-frame-final.png (last frame)');
}

generateAssets().catch(console.error);
