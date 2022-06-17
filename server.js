const { chromium } = require("playwright");
(async () => {
    let browser = await chromium.launch();

    let page = await browser.newPage();
    await page.setViewportSize({ width: 1000, height: 850 });

    await page.goto("https://pareeksha.mgu.ac.in/Pareeksha/index.php/Public/PareekshaResultView_ctrl/index/3");
    // await page.goto("https://dsdc.mgu.ac.in/exQpMgmt/index.php/public/ResultView_ctrl/");
    
    const prnList = require('./data.json');
    for (let i = 0; i < prnList.length; i++) {
        
        await page.selectOption('select#exam_id', prnList[i].exam_id);
        await page.fill('#prn', prnList[i].prn);
        await page.click('button#btnresult');

        // wait until the 3rd table within div#mgu_btech_contentholder is loaded
        await page.waitForSelector('div#mgu_btech_contentholder table:nth-child(3)', { visible: true });
        
        // await page.waitForTimeout(5000);
        await page.screenshot({
            path: `results/${prnList[i].prn}.png`
        });
    }

    await browser.close();
})();


// mgu_btech_contentholder