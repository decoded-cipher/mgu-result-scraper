require('dotenv').config()
const express = require('express')

const db = require('./config/db');
const utils = require('./helpers/utils.js');

const data = require('./public/data/data.json');
const analytics = require('./helpers/cbcs_analytics.js');


const app = express()

db.connect();

app.get('/', async () => {

    // await utils.fetchExamDetails();

    // await analytics.fetchAllResults(data.students, data.exam_id);
    // console.log("--- -------------------- ---");

    // await utils.generatePDFs(data.students);
    // console.log("--- -------------------- ---");
    // await utils.sendOutEmails(data.students);

    await analytics.processAllResults(data.students, data.exam_id);
    // console.log("--- -------------------- ---");

})

app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}`)
})