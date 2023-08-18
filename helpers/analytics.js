const { chromium } = require("playwright");
const fs = require('fs');
const path = require('path');
const { saveData, generateQid, checkQid } = require('./database.js');



module.exports = {

    fetchAllResults : async (students, exam_id) => {
        for (let i = 0; i < students.length; i++) {
            console.log(`--- Fetching result for ${students[i].prn}`);
            await module.exports.fetchResult(students[i].prn, exam_id);
        }
        console.log("\n--- All results fetched ---\n");
    },





    processAllResults : async (students, exam_id) => {
        for (let i = 0; i < students.length; i++) {
            console.log(`--- Processing result for ${students[i].prn}`);
            await module.exports.processResult(students[i].prn, exam_id);
        }
        console.log("\n--- All results processed ---\n");
    },





    fetchResult : async (student_id, exam_id) => {

        // let qid = generateQid(student_id, exam_id);
        // let result = await checkQid(qid);

        // if (result) {
        //     console.log("Data already present in database...");
        //     return;
        // }

        let browser = await chromium.launch();
        let page = await browser.newPage();
        await page.setViewportSize({ width: 1000, height: 850 });
        
        await page.goto("https://pareeksha.mgu.ac.in/Pareeksha/index.php/Public/PareekshaResultView_ctrl/index/3");
        // await page.goto("https://dsdc.mgu.ac.in/exQpMgmt/index.php/public/ResultView_ctrl/");
        
        await page.selectOption('select#exam_id', exam_id);
        await page.fill('#prn', student_id);
        await page.click('button#btnresult');

        await page.waitForSelector('div#mgu_btech_contentholder table:nth-child(4)', { visible: true });

        // wait for 2 seconds
        await page.waitForTimeout(1000);

        // get the result table
        const resultTable = await page.$('div#mgu_btech_contentholder table:nth-child(4)');
        const studentDetails = await page.$('div#mgu_btech_contentholder table:nth-child(3)');
        
        // get the result table html
        const resultTableHTML = await resultTable.innerHTML();
        const studentDetailsHTML = await studentDetails.innerHTML();
        
        // create folder if it doesn't exist with the name as exam_id inside public/analytics
        if (fs.existsSync(path.join(__dirname, `../public/analytics/${student_id}`), { recursive: true })) {
            fs.rm(path.join(__dirname, `../public/analytics/${student_id}`), { recursive: true });
        }
        
        fs.mkdirSync(path.join(__dirname, `../public/analytics/${student_id}`), { recursive: true });
        
        // write the result table html to a file
        fs.writeFileSync(path.join(__dirname, `../public/analytics/${student_id}/result.html`), resultTableHTML);
        fs.writeFileSync(path.join(__dirname, `../public/analytics/${student_id}/details.html`), studentDetailsHTML);
        

        // take a screenshot of the result page
        await page.screenshot({
            path: `public/screenshots/${student_id}.png`,
        });

        // close the browser instance ASAP
        await browser.close();

    },





    processResult : async (student_id, exam_id) => {

        let allSubjects = [];
        let semester = {};
        let flag = false;


        // get table html from the file
        let html = fs.readFileSync(path.join(__dirname, `../public/analytics/${student_id}/result.html`), 'utf8');
        
        // remove comments and blank lines from the html
        let htmlWithoutComments = html.replace(/<!--[\s\S]*?-->/g, '');
        htmlWithoutComments = htmlWithoutComments.replace(/^\s*[\r\n]/gm, '');

        
        // remove height="30" from the html
        // Because this pattern was causing descrepencieswhile searching for <td>...</td> (Semester Result)
        htmlWithoutComments = htmlWithoutComments.replace(/ height="30"/g, '');



        // loop through the html, following the pattern related to <tr>...</tr>
        // This continues until SEMESTER RESULT is found in the first <td> of the <tr>
        // Starts from 3rd <tr> because the first 2 <tr> are not needed as they are the headers

        for (let i = 3; flag == false; i++) {

            let pattern = '<tbody>[\\s\\S]*?';
            for (let j = 0; j < i-1; j++) {
                pattern = pattern + '<tr>[\\s\\S]*?';
            }
            pattern = pattern + '<tr>([\\s\\S]*?)<\\/tr>';
            // console.log(pattern);


            // get the first <tr> from the html (row)
            let row = htmlWithoutComments.match(pattern)[1];
            // console.log(row);

            
            // remove <strong> and </strong> from the html (row)
            row = row.replace(/<strong>/g, '');
            row = row.replace(/<\/strong>/g, '');
            
            
            // remove all \n and \t from the html (row)
            row = row.replace(/\n/g, '');
            row = row.replace(/\t/g, '');


            // // get the string between > and </td> (column) and store it in an array
            let column = row.match(/>(.*?)<\/td>/g);
            // console.log(column[0]);


            // if column[0] has SEMESTER RESULT then toggle the looping variable
            if (column[0].includes('SEMESTER RESULT')) {
                
                flag = true;
                // break;
                
                column[7] = column[7].replace(/<span style="color:#390;">/g, ''),
                column[7] = column[7].replace(/<\/span>/g, '')
            }


            // remove <span style="color:green;" from the beginning and </span from the end, if its not the last row
            !flag ? column[11] = column[11].replace(/<span style="color:green;">/g, '') : null;
            !flag ? column[11] = column[11].replace(/<\/span>/g, '') : null;


            // remove SCPA / SGPA:  from the beginning and tailing space from the end, if its the last row
            flag ? column[1] = column[1].replace(/SCPA \/ SGPA: /g, '') : null;
            flag ? column[1] = column[1].trim() : null;

                
            // loop through the column array and remove the > and </td> from each element
            for (let i = 0; i < column.length; i++) {
                column[i] = column[i].replace(/<\/?td>/g, '');
                column[i] = column[i].replace(/>/g, '');


                // also removespace from the beginning and end of the string
                // replace &amp; with &
                // remove &nbsp;
                column[i] = column[i].trim();
                column[i] = column[i].replace(/&amp;/g, '&');
                column[i] = column[i].replace(/&nbsp;/g, '');


                // replace blank string with null
                if (column[i] == '') {
                    column[i] = null;
                } else if (column[i] == '---') {
                    column[i] = null;
                }
            }
            // console.log(column);


            // convert the column array to an object and push it to allSubjects array
            // if its the last row then create a semester object and save details
            if (!flag) {

                let subject = {
                    course_code : column[0],
                    course : column[1],
                    external : {
                        esa : column[2] == null ? null : parseInt(column[2]),
                        max : column[3] == null ? null : parseInt(column[3]),
                    },
                    internal : {
                        isa : column[4] == null ? null : parseInt(column[4]),
                        max : column[5] == null ? null : parseInt(column[5]),
                    },
                    total : column[6] == null ? null : parseInt(column[6]),
                    max : column[7] == null ? null : parseInt(column[7]),
                    grade_points : column[8] == null ? null : parseFloat(column[8]),
                    credit_points : column[9] == null ? null : parseFloat(column[9]),
                    grade : column[10],
                    result : column[11]
                };
                allSubjects.push(subject);
    
            } else {
                semester = {
                    scpa : column[0] == null ? null : parseFloat(column[1]),
                    total : column[2] == null ? null : parseInt(column[2]),
                    max : column[3] == null ? null : parseInt(column[3]),
                    grade_points : column[4],
                    credit_points : column[5] == null ? null : parseFloat(column[5]),
                    grade : column[6],
                    result : column[7]
                }
            }

        }

        // call processExamDetails() to get the general student/exam details
        let studentDetails = await module.exports.processExamDetails(student_id, exam_id);

        semester = {
            ...studentDetails,
            result : {
                ...semester,
                subjects : allSubjects
            },
        }
        // console.log(semester);

        // save the semester object to a json file
        fs.writeFileSync(path.join(__dirname, `../public/analytics/${student_id}/semester.json`), JSON.stringify(semester));

        // save the semester object to the database
        await saveData(semester, student_id, exam_id);

    },





    processExamDetails : async (student_id) => {

        let details = [];

        // get table html from the file
        let html = fs.readFileSync(path.join(__dirname, `../public/analytics/${student_id}/details.html`), 'utf8');


        // get the html between the inner <tbody> and </tbody>
        let table = html.match(/<table[\s\S]*?<\/table>/g)[0];
        table = table.match(/<tbody[\s\S]*?<\/tbody>/g)[0];
        // console.log(table);


        // remove all <strong> and </strong> from the html
        table = table.replace(/<strong>/g, '');
        table = table.replace(/<\/strong>/g, '');
        // console.log(table);
        

        for (let i = 1; i < 6; i++) {

            // create a pattern to get the <tr> (rows) from the html
            let pattern = '<tbody>[\\s\\S]*?';
            for (let j = 0; j < i-1; j++) {
                pattern = pattern + '<tr>[\\s\\S]*?';
            }
            pattern = pattern + '<tr>([\\s\\S]*?)<\\/tr>';
            // console.log(pattern);


            // get the first <tr> from the html (row)
            // get the string between > and </td> (column) and store it in an array
            let row = table.match(pattern)[1];
            let column = row.match(/>(.*?)<\/td>/g);


            // remove > and </td> from the beginning and end of the string
            // remove blank spaces from the beginning and end of the string
            // replace &amp; with &
            column[2] = column[2].replace(/<\/?td>/g, '');
            column[2] = column[2].replace(/>/g, '');
            column[2] = column[2].trim();
            column[2] = column[2].replace(/&amp;/g, '&');


            // convert the uppercase string to title case
            if (column[2] == column[2].toUpperCase()) {
                column[2] = column[2].replace(/\w\S*/g, (txt) => {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                });
            }
            
            details.push(column[2]);
            
        }


        // create an object with the details array
        var studentDetails = {
            prn : details[0],
            name : details[1],
            semester : details[2],
            programme : details[3],
            exam_centre : details[4]
        };
        
        // console.log(studentDetails);
        return studentDetails;
    },





};