const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:5173');
  
  // Just log in and push to Section F
  try {
     await page.waitForSelector('button');
     let btns = await page.$$('button');
     await btns[0].click(); // General Public
     
     await new Promise(r => setTimeout(r, 500));
     btns = await page.$$('button');
     await btns[4].click(); // Initialize Workspace
     
     await new Promise(r => setTimeout(r, 500));
     for(let i=0; i<6; i++) {
        btns = await page.$$('button');
        await btns[btns.length-1].click(); // Next button
        await new Promise(r => setTimeout(r, 500));
     }
  } catch(e) {
     console.log('Script error:', e);
  }
  
  await browser.close();
})();
