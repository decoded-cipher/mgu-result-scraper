require('dotenv').config()

const data = require('./public/data.json');
const api = require('./api.js');
const analytics = require('./analytics.js');

(async () => {
    // await api.fetchExamDetails();

    // await api.getAllResults(data.students, data.exam_id);
    // console.log("--- -------------------- ---");
    // await api.generatePDFs(data.students);
    // console.log("--- -------------------- ---");
    // await api.sendOutEmails(data.students);


    // await analytics.fetchResults();
    // console.log("--- -------------------- ---");
    await analytics.processResults();

})();