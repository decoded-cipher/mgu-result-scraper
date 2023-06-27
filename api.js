const { chromium } = require("playwright");
const nodemailer = require("nodemailer");
const PDFDocument = require('pdfkit');

const fs = require('fs');
const path = require('path');

var htmlTemplate = path.join(__dirname, 'template/index.html');
var htmlToSend = fs.readFileSync(htmlTemplate, 'utf8').toString();

module.exports = {

    fetchExamDetails : async () => {
        let browser = await chromium.launch();
        let page = await browser.newPage();
        await page.setViewportSize({ width: 1000, height: 850 });

        await page.goto("https://pareeksha.mgu.ac.in/Pareeksha/index.php/Public/PareekshaResultView_ctrl/index/3");
        // await page.goto("https://dsdc.mgu.ac.in/exQpMgmt/index.php/public/ResultView_ctrl/");        
        console.log("\n--- Results Page loaded ---");
        
        let optionsArray = [];
        let selectBox = await page.$('select#exam_id');
        let options = await selectBox.$$('option');
        
        for (let i = 1; i < options.length; i++) {
            let exam_id = await options[i].getAttribute('value');
            let exam_name = await options[i].innerText();
            exam_name = exam_name.trim();
            
            let obj = {
                exam_id: exam_id,
                exam_name: exam_name
            }
            optionsArray.push(obj);
        }
        console.log("--- Exam details fetched ---");

        if (fs.existsSync('exam_details.json')) {
            fs.unlinkSync('exam_details.json');
            console.log("--- Old JSON file deleted ---");
        }
        
        fs.writeFileSync('exam_details.json', JSON.stringify(optionsArray), (err) => {
            if (err) throw err;
        });
        console.log("--- Exam details saved to JSON file ---");
        
        await browser.close();
        console.log("--- Browser closed ---\n");
    },


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
                var password = module.exports.generateCustomPassword(students[i]);
                var doc = new PDFDocument({
                    margin: 0,
                    size: [850, 850],
                    info: {
                        Title: 'MCA 3rd Semester Results',
                        Author: 'Arjun Krishna',

                    },
                    userPassword: password,
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


    sendOutEmails : async (students) => {
        console.log("\nStarting to send out emails...\n");
        for (let i = 0; i < students.length; i++) {
            await module.exports.sendEmail({
                recipient: students[i].email,
                prn: students[i].prn
            });
            console.log(`\nEmail sent to ${students[i].name}\n`);
        }
        console.log("\nAll emails sent!\n");
    },


    sendEmail : async (details) => {
        
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        var mailOptions = {
            from: `"Result Notification" <${process.env.EMAIL_USER}>`,
            to: details.recipient,
            subject: 'MCA 3rd Semester Results | Secure PDF Attached',
            html: htmlToSend,
            attachments: [
                {
                    filename: `${details.prn}.pdf`,
                    path: `secure/${details.prn}.pdf`,
                    contentType: 'application/pdf'
                }
            ],
            headers: { 'x-myheader': 'test header' }
        };
        
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

    },


    generateCustomPassword : (details) => {
        var name = details.name;
        var birthdate = details.dob;
        var password = name.substring(0, 4).toUpperCase() + birthdate.substring(8, 10) + birthdate.substring(5, 7);
        return password;
    }

};