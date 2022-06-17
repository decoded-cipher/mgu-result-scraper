const { chromium } = require("playwright");
const prnList = require('./data.json');

(async () => {
    let browser = await chromium.launch();
    let page = await browser.newPage();
    await page.setViewportSize({ width: 1000, height: 850 });

    await page.goto("https://pareeksha.mgu.ac.in/Pareeksha/index.php/Public/PareekshaResultView_ctrl/index/3");
    // await page.goto("https://dsdc.mgu.ac.in/exQpMgmt/index.php/public/ResultView_ctrl/");
    
    await page.selectOption('select#exam_id', prnList.exam_id);
    for (let i = 0; i < prnList.prn.length; i++) {
        
        await page.fill('#prn', prnList.prn[i]);
        await page.click('button#btnresult');

        await page.waitForSelector('div#mgu_btech_contentholder table:nth-child(3)', { visible: true });
        await page.screenshot({
            path: `results/${prnList.prn[i]}.png`
        });
    }

    await browser.close();
})();