require('dotenv').config()

const data = require('./data.json');
const api = require('./api.js');

(async () => {
    await api.fetchExamDetails();

    // await api.getAllResults(data.students, data.exam_id);
    // console.log("--- -------------------- ---");
    // await api.generatePDFs(data.students);
    // console.log("--- -------------------- ---");
    // await api.sendOutEmails(data.students);
})();