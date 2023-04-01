const { chromium } = require("playwright");

const PDFDocument = require('pdfkit');
const fs = require('fs');

module.exports = {

    getAllResults : async (students, exam_id) => {
        let browser = await chromium.launch();
        let page = await browser.newPage();

        await page.setViewportSize({ width: 1000, height: 850 });
        await page.goto("https://pareeksha.mgu.ac.in/Pareeksha/index.php/Public/PareekshaResultView_ctrl/index/3");
        // await page.goto("https://dsdc.mgu.ac.in/exQpMgmt/index.php/public/ResultView_ctrl/");
        await page.selectOption('select#exam_id', exam_id);

        console.log("\nStarting to take screenshots...\n");

        for (let i = 0; i < students.length; i++) {
            
            await page.fill('#prn', students[i].prn);
            await page.click('button#btnresult');

            await page.waitForSelector('div#mgu_btech_contentholder table:nth-child(3)', { visible: true });
            await page.screenshot({
                path: `results/${students[i].prn}.png`,
            });
            console.log(`Screenshot taken for ${students[i].name}`);
        }

        await browser.close();
        console.log("\nAll screenshots taken!\n");
    },


    generatePDFs : async (students) => {
        console.log("\nStarting to generate PDFs...\n");
        for (let i = 0; i < students.length; i++) {
        
            try {
                var doc = new PDFDocument({
                    margin: 0,
                    size: [850, 850],
                    info: {
                        Title: 'MGU Result Scraper',
                        Author: 'Arjun Krishna',

                    },
                    userPassword: 'password',
                });

                var stream = fs.createWriteStream(`secure/${students[i].prn}.pdf`);
                doc.pipe(stream);
                doc.image(`results/${students[i].prn}.png`, 0, 20, { width: 850, height: 850 });
                doc.end();
            } catch (error) {
                console.log(error);
            }

            console.log(`PDF generated for ${students[i].name}`);
        }
        console.log("\nAll PDFs generated!\n");
    },


    sendEmails : async (students) => {}

};