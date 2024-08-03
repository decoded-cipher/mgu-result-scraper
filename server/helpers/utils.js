const { chromium } = require("playwright");
const nodemailer = require("nodemailer");
const PDFDocument = require('pdfkit');

const fs = require('fs');
const path = require('path');

let htmlTemplate = path.join(__dirname, '../public/templates/student_email.html');
let htmlToSend = fs.readFileSync(htmlTemplate, 'utf8').toString();

module.exports = {

    fetchExamDetails : async () => {
        let browser = await chromium.launch({
            executablePath: process.env.CHROMIUM_PATH,
            headless: true
        });
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
                exam_id: parseInt(exam_id),
                exam_name: exam_name
            }
            optionsArray.push(obj);
        }
        console.log("--- Exam details fetched ---");
        
        optionsArray.sort((a, b) => {
            return b.exam_id - a.exam_id;
        });
        console.log("--- Sorted the array in desc order ---");

        if (fs.existsSync('public/exam_details.json')) {
            fs.unlinkSync('public/exam_details.json');
            console.log("--- Old JSON file deleted ---");
        }

        fs.writeFileSync('public/exam_details.json', JSON.stringify(optionsArray), (err) => {
            if (err) throw err;
        });
        console.log("--- Exam details saved to JSON file ---");
        
        await browser.close();
        console.log("--- Browser closed ---\n");
    },


    generatePDFs : async (students) => {
        console.log("\nStarting to generate PDFs...\n");
        for (let i = 0; i < students.length; i++) {
        
            try {
                let password = module.exports.generateCustomPassword(students[i]);
                let doc = new PDFDocument({
                    margin: 0,
                    size: [850, 850],
                    info: {
                        Title: 'MCA 3rd Semester Results',
                        Author: 'Arjun Krishna',

                    },
                    userPassword: password,
                });

                let stream = fs.createWriteStream(`public/secure_pdfs/${students[i].prn}.pdf`);
                doc.pipe(stream);
                doc.image(`public/screenshots/${students[i].prn}.png`, 0, 20, { width: 850, height: 850 });
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
        
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        let mailOptions = {
            from: `"Result Notification" <${process.env.EMAIL_USER}>`,
            to: details.recipient,
            subject: 'MCA 3rd Semester Results | Secure PDF Attached',
            html: htmlToSend,
            attachments: [
                {
                    filename: `${details.prn}.pdf`,
                    path: `public/secure_pdfs/${details.prn}.pdf`,
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
        let name = details.name;
        let birthdate = details.dob;
        let password = name.substring(0, 4).toUpperCase() + birthdate.substring(8, 10) + birthdate.substring(5, 7);
        return password;
    }

};