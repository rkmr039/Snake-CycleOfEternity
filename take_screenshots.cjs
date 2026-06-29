const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const executablePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
];

let executablePath = '';
for (const p of executablePaths) {
  if (fs.existsSync(p)) {
    executablePath = p;
    break;
  }
}

if (!executablePath) {
  console.error('No suitable browser (Chrome or Edge) executable found!');
  process.exit(1);
}

console.log('Using browser executable:', executablePath);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });

  // Create screenshots directory
  const ssDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(ssDir)) {
    fs.mkdirSync(ssDir);
  }

  // Helper to load fresh page
  const loadFreshPage = async () => {
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2' });
    await sleep(800);
  };

  // Helper to click start session
  const startSession = async () => {
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('START SESSION')) {
        await btn.click();
        await sleep(800);
        return;
      }
    }
  };

  // 1. MENU State
  console.log('Capturing MENU state...');
  await loadFreshPage();
  await page.screenshot({ path: path.join(ssDir, '01_menu.png') });

  // 2. INSTRUCTIONS State
  console.log('Capturing INSTRUCTIONS state...');
  await loadFreshPage();
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('RULES & CONTROLS')) {
      await btn.click();
      await sleep(500);
      break;
    }
  }
  await page.screenshot({ path: path.join(ssDir, '02_instructions.png') });

  // 3. PLAYING State
  console.log('Capturing PLAYING state...');
  await loadFreshPage();
  await startSession();
  await page.screenshot({ path: path.join(ssDir, '03_playing.png') });

  // 4. PAUSED State
  console.log('Capturing PAUSED state...');
  await loadFreshPage();
  await startSession();
  await page.keyboard.press('Space');
  await sleep(500);
  await page.screenshot({ path: path.join(ssDir, '04_paused.png') });

  // 5. GAME_OVER State with New High Score
  console.log('Capturing GAME_OVER state...');
  await loadFreshPage();
  await startSession();
  await page.keyboard.press('g');
  await sleep(500);
  await page.screenshot({ path: path.join(ssDir, '05_game_over.png') });

  // 6. OUROBOROS State
  console.log('Capturing OUROBOROS state...');
  await loadFreshPage();
  await startSession();
  await page.keyboard.press('o');
  await sleep(500);
  await page.screenshot({ path: path.join(ssDir, '06_ouroboros.png') });

  // 7. VICTORY State
  console.log('Capturing VICTORY state...');
  await loadFreshPage();
  await startSession();
  await page.keyboard.press('v');
  await sleep(500);
  await page.screenshot({ path: path.join(ssDir, '07_victory.png') });

  await browser.close();
  console.log('All 7 screenshots captured successfully in /screenshots folder!');
})();
