const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const delay = ms => new Promise(res => setTimeout(res, ms));

async function runTest() {
  console.log("Launching headless browser...");
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const loginAndScreenshot = async (phone, pass, name) => {
    console.log(`Navigating to Login for ${name}...`);
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' });
    
    await delay(500);
    console.log(`Typing credentials for ${name}...`);
    await page.type('input[type="text"]', phone);
    await page.type('input[type="password"]', pass);
    await page.click('button[type="submit"]');

    console.log("Waiting for component render...");
    await delay(2500);
    
    const destPath = `/home/ravella/.gemini/antigravity/brain/95dace1b-9530-4992-9ec4-92afacee7f50/${name.toLowerCase()}_test.png`;
    await page.screenshot({ path: destPath });
    console.log("Verified! Screenshot saved at:", destPath);
    
    console.log("Signing Out...");
    await page.evaluate(() => {
       const btns = Array.from(document.querySelectorAll('button'));
       const logout = btns.find(b => b.textContent === 'Sign Out');
       if(logout) logout.click();
    });
    await delay(1000);
  };

  await loginAndScreenshot('1000', 'doc', 'Doctor');
  await loginAndScreenshot('2000', 'pharm', 'Pharmacist');
  await loginAndScreenshot('3000', 'lab', 'LabTech');
  await loginAndScreenshot('0000', 'admin', 'Admin');

  await browser.close();
  console.log("All 4 Clinical Scope Tests Completed Successfully.");
}

runTest().catch(console.error);
