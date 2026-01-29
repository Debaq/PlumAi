import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

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
    'relations',
    'bestiary',
    'worldRules',
    'sidebar',
    'npcs'
];

async function convertPngToWebp(dirPath) {
    if (!fs.existsSync(dirPath)) return;

    const files = fs.readdirSync(dirPath);
    const pngFiles = files.filter(file => /\.png$/i.test(file));

    for (const pngFile of pngFiles) {
        const pngPath = path.join(dirPath, pngFile);
        const webpFile = pngFile.replace(/\.png$/i, '.webp');
        const webpPath = path.join(dirPath, webpFile);

        // Solo convertir si el webp no existe o el png es más reciente
        const pngStat = fs.statSync(pngPath);
        const webpExists = fs.existsSync(webpPath);
        const webpStat = webpExists ? fs.statSync(webpPath) : null;

        if (!webpExists || pngStat.mtime > webpStat.mtime) {
            console.log(`Converting ${pngFile} -> ${webpFile}`);
            await sharp(pngPath)
                .webp({ quality: 85 })
                .toFile(webpPath);
        }

        // Eliminar el PNG después de convertir
        if (fs.existsSync(webpPath)) {
            fs.unlinkSync(pngPath);
            console.log(`Deleted ${pngFile}`);
        }
    }
}

async function generateManifest() {
    const manifest = {};

    // Primero convertir todos los PNG a WEBP
    for (const category of categories) {
        const dirPath = path.join(PUBLIC_DIR, BANNER_ROOT, category);
        await convertPngToWebp(dirPath);
    }

    // Luego generar el manifest con los WEBP
    categories.forEach(category => {
        const dirPath = path.join(PUBLIC_DIR, BANNER_ROOT, category);
        if (fs.existsSync(dirPath)) {
            const files = fs.readdirSync(dirPath).filter(file => {
                return /\.webp$/i.test(file) || /\.svg$/i.test(file);
            });
            manifest[category] = files.map(f => path.join('/', BANNER_ROOT, category, f));
        } else {
            manifest[category] = [];
        }
    });

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
    console.log(`Manifest generated at ${OUTPUT_FILE}`);
    console.log(manifest);
}

generateManifest().catch(console.error);
