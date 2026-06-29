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

  console.log('Navigating to game...');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2' });
  await sleep(1000);

  // 1. MENU State
  console.log('Capturing MENU state...');
  await page.screenshot({ path: path.join(ssDir, '01_menu.png') });

  // 2. INSTRUCTIONS State
  console.log('Opening instructions...');
  // Click RULES & CONTROLS button
  const buttons = await page.$$('button');
  let rulesButton;
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('RULES & CONTROLS')) {
      rulesButton = btn;
      break;
    }
  }
  
  if (rulesButton) {
    await rulesButton.click();
    await sleep(500);
    console.log('Capturing INSTRUCTIONS state...');
    await page.screenshot({ path: path.join(ssDir, '02_instructions.png') });
    // Go back
    const backBtn = await page.$('button');
    if (backBtn) await backBtn.click();
    await sleep(500);
  }

  // 3. PLAYING State
  console.log('Starting session...');
  const startButton = await page.$('button'); // First button should be start
  if (startButton) {
    await startButton.click();
    await sleep(1000);
    console.log('Capturing PLAYING state...');
    await page.screenshot({ path: path.join(ssDir, '03_playing.png') });
  }

  // 4. PAUSED State
  console.log('Pausing session...');
  await page.keyboard.press('Space');
  await sleep(500);
  console.log('Capturing PAUSED state...');
  await page.screenshot({ path: path.join(ssDir, '04_paused.png') });

  // Resume before hitting debug keys
  await page.keyboard.press('Space');
  await sleep(500);

  // 5. GAME_OVER State with New High Score
  console.log('Triggering GAME_OVER via debug key...');
  await page.keyboard.press('g');
  await sleep(500);
  console.log('Capturing GAME_OVER state...');
  await page.screenshot({ path: path.join(ssDir, '05_game_over.png') });

  // Restart to go to playing state then trigger Ouroboros
  console.log('Restarting game...');
  const restartButton = await page.$('button'); // Restart button should be first
  if (restartButton) {
    await restartButton.click();
    await sleep(500);
    
    // 6. OUROBOROS State
    console.log('Triggering OUROBOROS via debug key...');
    await page.keyboard.press('o');
    await sleep(500);
    console.log('Capturing OUROBOROS state...');
    await page.screenshot({ path: path.join(ssDir, '06_ouroboros.png') });

    // Go back to game over overlay
    const embraceButton = await page.$('button');
    if (embraceButton) {
      await embraceButton.click();
      await sleep(500);
    }
  }

  // Restart to go to playing state then trigger Victory
  console.log('Going to menu...');
  const menuButtons = await page.$$('button');
  let quitButton;
  for (const btn of menuButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('MENU')) {
      quitButton = btn;
      break;
    }
  }
  if (quitButton) {
    await quitButton.click();
    await sleep(500);
  }

  // Start again
  const startBtn2 = await page.$('button');
  if (startBtn2) {
    await startBtn2.click();
    await sleep(500);

    // 7. VICTORY State
    console.log('Triggering VICTORY via debug key...');
    await page.keyboard.press('v');
    await sleep(500);
    console.log('Capturing VICTORY state...');
    await page.screenshot({ path: path.join(ssDir, '07_victory.png') });
  }

  await browser.close();
  console.log('All screenshots captured successfully in /screenshots folder!');
})();
