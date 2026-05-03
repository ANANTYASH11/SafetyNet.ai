// generate_pdf.mjs — Generate PDF from VIVA_PREPARATION.html using puppeteer
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlFile  = join(__dirname, 'VIVA_PREPARATION.html');
const pdfFile   = join(__dirname, 'VIVA_PREPARATION_GUIDE.pdf');

// Check if puppeteer is installed, if not try alternative approach
async function generateWithPuppeteer() {
  const { default: puppeteer } = await import('puppeteer');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page    = await browser.newPage();
  await page.goto('file:///' + htmlFile.replace(/\\/g, '/'), { waitUntil: 'networkidle0', timeout: 30000 });
  // Give Google Fonts time to load
  await new Promise(r => setTimeout(r, 2000));
  await page.pdf({
    path:   pdfFile,
    format: 'A4',
    printBackground: true,
    margin: { top: '12mm', bottom: '12mm', left: '10mm', right: '10mm' },
    displayHeaderFooter: false,
  });
  await browser.close();
  console.log('PDF saved to: ' + pdfFile);
}

generateWithPuppeteer().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
