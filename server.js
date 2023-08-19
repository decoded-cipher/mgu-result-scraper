require('dotenv').config()
const express = require('express')

const db = require('./config/db');
const utils = require('./helpers/utils.js');

const data = require('./public/data/temp.json');

const ug_analytics = require('./helpers/ug_analytics.js');
const pg_analytics = require('./helpers/pg_analytics.js');

const app = express()

db.connect();

app.get('/', async (req, res) => {

    let analytics = null;
    let mode = req.query.mode;

    mode == "ug" ? analytics = ug_analytics : analytics = pg_analytics;

    if(!mode) {
        res.send({
            status: "error",
            message: "Please specify the mode of the exam. (ug/pg)"
        });
        return;
    } else if(mode != "ug" && mode != "pg") {
        res.send({
            status: "error",
            message: "Invalid mode specified. (ug/pg)"
        });
        return;
    } else {

        // await utils.fetchExamDetails();
    
        await analytics.fetchAllResults(data.students, data.exam_id);
        // console.log("--- -------------------- ---");
    
        // await utils.generatePDFs(data.students);
        // console.log("--- -------------------- ---");
    
        // await utils.sendOutEmails(data.students);
        // console.log("--- -------------------- ---");
    
        // await analytics.processAllResults(data.students, data.exam_id);
        // console.log("--- -------------------- ---");

    }

    res.send(data);

})

app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}`)
})