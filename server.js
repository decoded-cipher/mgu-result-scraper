require('dotenv').config()

const data = require('./public/data.json');
const utils = require('./helpers/utils.js');
const analytics = require('./helpers/analytics.js');
const db = require('./config/db');


(async () => {
    await db.connect();
    // await utils.fetchExamDetails();

    await analytics.fetchAllResults(data.students, data.exam_id);
    // console.log("--- -------------------- ---");

    // await utils.generatePDFs(data.students);
    // console.log("--- -------------------- ---");
    // await utils.sendOutEmails(data.students);

    await analytics.processAllResults(data.students, data.exam_id);
    // console.log("--- -------------------- ---");
})();