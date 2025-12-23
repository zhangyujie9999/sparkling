import fs from 'fs';
import path from 'path';

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`Source directory ${src} does not exist, skipping copy`);
    return;
  }
  
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const sourceDir = args[0] || 'dist';
const androidDest = args[1] || 'android/app/src/main/assets';
const iosDest = args[2] || 'ios/SparklingGo/SparklingGo/Resources/Assets';

// Copy to Android assets
console.log(`Copying ${sourceDir} to Android (${androidDest})...`);
copyDir(sourceDir, androidDest);

// Copy to iOS assets
console.log(`Copying ${sourceDir} to iOS (${iosDest})...`);
copyDir(sourceDir, iosDest);

console.log('Assets copied successfully!');