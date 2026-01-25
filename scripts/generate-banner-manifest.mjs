import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = 'public';
const BANNER_ROOT = 'img/banner';
const OUTPUT_FILE = 'public/banners.json';

const categories = [
    'lore', 
    'chapters', 
    'scenes', 
    'characters', 
    'locations', 
    'events',
    'images',
    'versionControl',
    'stats',
    'aiAssistant',
    'ragStudio',
    'worldbuilder',
    'relations'
];
const manifest = {};

categories.forEach(category => {
    const dirPath = path.join(PUBLIC_DIR, BANNER_ROOT, category);
    if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath).filter(file => {
            return /\.(png|jpg|jpeg|webp|gif)$/i.test(file);
        });
        manifest[category] = files.map(f => path.join('/', BANNER_ROOT, category, f));
    } else {
        manifest[category] = [];
    }
});

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
console.log(`Manifest generated at ${OUTPUT_FILE}`);
console.log(manifest);
