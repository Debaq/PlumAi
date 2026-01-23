// scripts/migrate-i18n.mjs
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LEGACY_PATH = path.resolve(__dirname, '../legacy/js/i18n/locales');
const OUTPUT_PATH = path.resolve(__dirname, '../src/messages');

async function parseTranslationFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    // Remove 'export default' and any trailing comments/semicolons
    const jsonString = content
      .replace('export default', '')
      .replace(/;\s*$/, '')
      .trim();
    // This is risky, but necessary for the file format
    return eval(`(${jsonString})`);
  } catch (error) {
    console.error(`Error parsing file ${filePath}:`, error);
    return {};
  }
}

async function migrateLocale(locale) {
  const localePath = path.join(LEGACY_PATH, locale);
  const files = await fs.readdir(localePath);
  const combinedTranslations = {};

  for (const file of files) {
    const filePath = path.join(localePath, file);
    const fileName = path.basename(file, '.js');
    const translations = await parseTranslationFile(filePath);
    combinedTranslations[fileName] = translations;
  }

  // Also process the global file
  const globalFilePath = path.join(LEGACY_PATH, `${locale}-global.js`);
  try {
      const globalContent = await fs.readFile(globalFilePath, 'utf-8');
      // A more complex regex to find the object inside the file
      const match = globalContent.match(/window\.translations_[a-z]{2}\s*=\s*({[\s\S]*?});/);
      if (match && match[1]) {
          const globalTranslations = eval(`(${match[1]})`);
          Object.assign(combinedTranslations, globalTranslations);
      }
  } catch(e){
      // Ignore if global file doesn't exist
  }


  return combinedTranslations;
}

async function main() {
  await fs.mkdir(OUTPUT_PATH, { recursive: true });

  const enTranslations = await migrateLocale('en');
  await fs.writeFile(
    path.join(OUTPUT_PATH, 'en.json'),
    JSON.stringify(enTranslations, null, 2)
  );
  console.log('English translations migrated successfully.');

  const esTranslations = await migrateLocale('es');
  await fs.writeFile(
    path.join(OUTPUT_PATH, 'es.json'),
    JSON.stringify(esTranslations, null, 2)
  );
  console.log('Spanish translations migrated successfully.');
}

main().catch(console.error);
