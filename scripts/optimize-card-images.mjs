import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '..', 'public', 'save-the-date');

async function optimizeImages() {
  const source = join(publicDir, 'card-hires-1.png');
  
  // Create WebP versions at different sizes
  await sharp(source)
    .resize(1200, 1200, { fit: 'inside' })
    .webp({ quality: 90 })
    .toFile(join(publicDir, 'card-1200.webp'));
  console.log('Created card-1200.webp');
  
  await sharp(source)
    .resize(2400, 2400, { fit: 'inside' })
    .webp({ quality: 90 })
    .toFile(join(publicDir, 'card-2400.webp'));
  console.log('Created card-2400.webp');
  
  console.log('Image optimization complete!');
}

optimizeImages().catch(console.error);
