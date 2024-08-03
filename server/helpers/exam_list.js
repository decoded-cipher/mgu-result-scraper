
let { chromium } = require("playwright");


module.exports = {


    fetchExams : async (mode) => {

        let browser = await chromium.launch({
            executablePath: process.env.CHROMIUM_PATH,
            headless: true
        });
        let page = await browser.newPage();
        await page.setViewportSize({ width: 1000, height: 850 });
        
        // go to the result page
        if (mode === 'UG') {
            await page.goto("https://dsdc.mgu.ac.in/exQpMgmt/index.php/public/ResultView_ctrl/");
        } else if (mode === 'PG') {
            await page.goto("https://pareeksha.mgu.ac.in/Pareeksha/index.php/Public/PareekshaResultView_ctrl/index/3/422");
        }

        // get all the options of the exam dropdown
        let exams = await page.$$('select#exam_id option');
        let exam_list = [];
        
        // create an array of exam objects with exam_id and title
        for (let exam of exams) {
            let exam_id = await exam.getAttribute('value');
            let title = await exam.innerText();
            exam_list.push({ exam_id, title, mode });
        }
        
        // close the browser instance ASAP
        await browser.close();

        // remove any unwanted characters from the title
        exam_list = exam_list.map(exam => {
            exam.title = exam.title.replace(/\n|\t/g, '').trim();
            return exam;
        });

        // remove the first element from the exam_list array
        exam_list.shift();
        return exam_list;

    }


};