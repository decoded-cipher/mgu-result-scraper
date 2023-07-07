const { chromium } = require("playwright");
const fs = require('fs');
const path = require('path');
const { pattern } = require("pdfkit");

module.exports = {

    getResult : async () => {
        let browser = await chromium.launch();
        let page = await browser.newPage();

        await page.setViewportSize({ width: 1000, height: 850 });
        await page.goto("https://pareeksha.mgu.ac.in/Pareeksha/index.php/Public/PareekshaResultView_ctrl/index/3");
        await page.selectOption('select#exam_id', "58");

        await page.fill('#prn', "203242211001");
        await page.click('button#btnresult');

        await page.waitForSelector('div#mgu_btech_contentholder table:nth-child(4)', { visible: true });
        
        // get the result table
        const resultTable = await page.$('div#mgu_btech_contentholder table:nth-child(4)');
        
        // get the result table html
        const resultTableHTML = await resultTable.innerHTML();

        // delete result.html if it exists
        if (fs.existsSync(path.join(__dirname, 'public/analytics/result.html'))) {
            fs.unlinkSync(path.join(__dirname, 'public/analytics/result.html'));
        }

        // write the result table html to a file
        fs.writeFileSync(path.join(__dirname, 'public/analytics/result.html'), resultTableHTML);

        await browser.close();
    },









    processData : () => {

        let studentMarks = [];
        let html = fs.readFileSync(path.join(__dirname, 'public/analytics/result.html'), 'utf8');
        let htmlWithoutComments = html.replace(/<!--[\s\S]*?-->/g, '');
        // remove blank lines
        htmlWithoutComments = htmlWithoutComments.replace(/^\s*[\r\n]/gm, '');


        // get the count of <tr> in the html
        let totalDivCount = (htmlWithoutComments.match(/<tr/g) || []).length;
        // console.log(totalDivCount);




        // fs.writeFileSync(path.join(__dirname, 'public/analytics/result-bkp.html'), htmlWithoutComments);


        // run a loop for 8 times
        // totalDivCount - (2 + 4 + 1)

        for (let i = 3; i < ((totalDivCount + 3) - 7); i++) {


            var pattern = '<tbody>[\\s\\S]*?';
            for (let j = 0; j < i-1; j++) {
                pattern = pattern + '<tr>[\\s\\S]*?';
            }
            pattern = pattern + '<tr>([\\s\\S]*?)<\\/tr>';
            // console.log(pattern);


            // get the first <td> in the <tr>
            let subject_1 = htmlWithoutComments.match(pattern)[1];
            // console.log(subject_1);
            

            // remove all \n and \t
            subject_1 = subject_1.replace(/\n/g, '');
            subject_1 = subject_1.replace(/\t/g, '');


            // count the string 'class="bord_rslt"' in the subject_1
            let count = (subject_1.match(/class="bord_rslt"/g) || []).length;
            // console.log(count);


            // // get the string between > and </td> and store it in an array
            let subject_1_data = subject_1.match(/>(.*?)<\/td>/g);
            // console.log(subject_1_data);


            // remove <strong><span style="color:green;">
            subject_1_data[11] = subject_1_data[11].replace(/<strong><span style="color:green;">/g, '');


            // remove </span</strong' from the end
            subject_1_data[11] = subject_1_data[11].replace(/<\/span><\/strong>/g, '');


            // loop through the subject_1_data array and remove the > and </td> from each element
            for (let i = 0; i < subject_1_data.length; i++) {
                subject_1_data[i] = subject_1_data[i].replace(/<\/?td>/g, '');
                subject_1_data[i] = subject_1_data[i].replace(/>/g, '');


                // also removespace from the beginning and end of the string
                subject_1_data[i] = subject_1_data[i].trim();


                // replace &amp; with &
                subject_1_data[i] = subject_1_data[i].replace(/&amp;/g, '&');


                // replace blank string with null
                if (subject_1_data[i] == '') {
                    subject_1_data[i] = null;
                } else if (subject_1_data[i] == '---') {
                    subject_1_data[i] = null;
                }
            }
            // console.log(subject_1_data);






            // convert the subject_1_data array to an object
            let subject = {
                course_code : subject_1_data[0],
                course : subject_1_data[1],
                external : {
                    esa : subject_1_data[2] == null ? null : parseInt(subject_1_data[2]),
                    max : subject_1_data[3] == null ? null : parseInt(subject_1_data[3]),
                },
                internal : {
                    isa : subject_1_data[4] == null ? null : parseInt(subject_1_data[4]),
                    max : subject_1_data[5] == null ? null : parseInt(subject_1_data[5]),
                },
                total : subject_1_data[6] == null ? null : parseInt(subject_1_data[6]),
                max : subject_1_data[7] == null ? null : parseInt(subject_1_data[7]),
                grade_points : subject_1_data[8] == null ? null : parseFloat(subject_1_data[8]),
                credit_points : subject_1_data[9] == null ? null : parseFloat(subject_1_data[9]),
                grade : subject_1_data[10],
                result : subject_1_data[11]
            };

            studentMarks.push(subject);

        }

        console.log(studentMarks);

    }





};